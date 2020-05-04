import * as vscode from 'vscode';
import { basename } from 'path';

/**
 * Opens a resource in the current windows editor
 * 
 * @param resource vscode.Uri of the resource to be opened
 * @param position position in the editor the curse will be opened to
 */
export async function openResource(resource: vscode.Uri, position: number): Promise<void> {
    const editor = await vscode.window.showTextDocument(resource);
    const pos = editor.document.positionAt(position);
    editor.revealRange(new vscode.Range(pos, pos), vscode.TextEditorRevealType.InCenter);
    editor.selection = new vscode.Selection(pos, pos);
}

/**
 * Registers a command
 * 
 * @param context the extentions context
 * @param name the name of the command
 * @param handler the function to be executed when the command is called
 */
export function registerCommand(context: vscode.ExtensionContext, name: string, handler: (...args: any[]) => any) {
    context.subscriptions.push(vscode.commands.registerCommand(name, handler));
}

/**
 * A command to open the file provided in the constructor
 */
class OpenFileCommand implements vscode.Command {
    command : string = 'extension.openFile';
    title : string = 'Open File';
    arguments?: any[];

	/**
	 * 
	 * 
	 * @param uri the resource that is open by calling the command
	 */
    constructor(uri: vscode.Uri) {
        this.arguments = [uri];
    }
}

/**
 * An extention of the vscode.TreeItem to contain one pin item with the command to open the resource
 */
export class PinItem extends vscode.TreeItem {
    filename : string;
	filepath : string;
	
	/**
	 * Creates a vscode.Uri.file resource for the file provided and a command to open the resource
	 * 
	 * @param filepath path to the source 
	 */
    constructor(filepath: string) {
        super(basename(filepath), vscode.TreeItemCollapsibleState.None);
        this.filepath = filepath;
        this.filename = basename(filepath);
        var uri = vscode.Uri.file(filepath);
        this.contextValue = '$Pin';
        this.command = new OpenFileCommand(uri);
    }
}

/**
 * 
 */
export class PinItModel implements vscode.TreeDataProvider<PinItem> {
	private _onDidChangeTreeData: vscode.EventEmitter<PinItem | undefined> = new vscode.EventEmitter<PinItem | undefined>();
    readonly onDidChangeTreeData: vscode.Event<PinItem | undefined> = this._onDidChangeTreeData.event;
    workspaceState: vscode.Memento;

	/**
	 * 
	 * @param element 
	 */
    getTreeItem(element: PinItem): vscode.TreeItem | Thenable<vscode.TreeItem> {
        return element;
    }

	/**
	 * 
	 * @param element 
	 */
    getChildren(element?: PinItem): Thenable<PinItem[]> {
        if (!element) {
            var pins = this.workspaceState.get<any[]>("pins");
            
            var pinList:PinItem[] = [];
            if (!!pins) {
                pins.forEach(function(e:string) {
                    if (!!e) {
                        var p = new PinItem(e);
                        pinList.push(p);
                    }
                });
                
                return Promise.resolve(pinList);
            }
            return Promise.resolve([]);
        }
        return Promise.resolve([]);
    }

	/**
	 * 
	 * @param element 
	 * 
	 */
    getParent?(element: PinItem): vscode.ProviderResult<PinItem> {
        return null;
    }

	/**
	 * Reads in the list of pinned resources from the workspace and updates the model
	 */
    async refresh() {
        try {
            var pins = this.workspaceState.get<any[]>("pins");
            var pinList:PinItem[] = [];
            if (!!pins) {
                pins.forEach(function(e:string) {
                    if (!!e) {
                        var p = new PinItem(e);
                        pinList.push(p);
                    }
                });
            }
            this._onDidChangeTreeData.fire();
            return Promise.resolve(pinList);
        } catch (e) {
            return Promise.reject(e);
        }
    }

	/**
	 * 
	 * @param element 
	 */
    async addItem(element: PinItem) {
        var pins = this.workspaceState.get<any[]>("pins");
        if (!!pins) {
            pins.push(element.filepath);
            this.workspaceState.update("pins", pins);
            this.refresh();
        } else {
            this.workspaceState.update("pins", [element.filepath]);
        }
    }

    /**
	 * 
	 * @param element 
	 */
    async removeItem(element: PinItem) {
        var pins = this.workspaceState.get<any[]>("pins");
        var pinList:string[] = [];
        if (!!pins) {
            pins.forEach(function(e:string) {
                if (e !== element.filepath) {
                    pinList.push(e);
                }
            });
            this.workspaceState.update("pins", pinList);
            this.refresh();
        }
    }

	/**
	 * 
	 */
    async Clearitems() {
        this.workspaceState.update("pins", []);
        this.refresh();
    }

	/**
	 * 
	 * @param workspaceState 
	 */
    constructor(workspaceState: vscode.Memento) {
        this.workspaceState = workspaceState;
    }
}

/**
 * 
 */
export class PinItController {

	/**
	 * 
	 * @param model 
	 */
    constructor(private model: PinItModel) { }

	/**
	 * 
	 * @param resource 
	 */
    openFile(resource: vscode.Uri) {
        return openResource(resource, 0);
    }

	/**
	 * 
	 */
    addPinItem() {
        var f =  vscode.window.activeTextEditor;
        var fsPath;
        if (!!f) {
            var item = new PinItem(f.document.uri.fsPath);
            return this.model.addItem(item);
        }
        
    }

	/**
	 * 
	 * @param item 
	 */
    removePinItem(item: PinItem) {
        return this.model.removeItem(item);
    }

	/**
	 * 
	 */
    clearPinItems() {
        return this.model.Clearitems();
    }

}

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
    const pinItModel = new PinItModel(context.workspaceState);
    const pinItController = new PinItController(pinItModel);

    registerCommand(context, 'pinList.openEntry', pinItController.openFile.bind(pinItController));
    registerCommand(context, 'pinList.addEntry', pinItController.addPinItem.bind(pinItController));
    registerCommand(context, 'pinList.removeEntry', pinItController.removePinItem.bind(pinItController));
    registerCommand(context, 'pinList.clearAllEntry', pinItController.clearPinItems.bind(pinItController));
	context.subscriptions.push(vscode.window.registerTreeDataProvider('pinItExplorer', pinItModel));
	
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "pinit" is now active!');
}

// this method is called when your extension is deactivated
export function deactivate() {}
