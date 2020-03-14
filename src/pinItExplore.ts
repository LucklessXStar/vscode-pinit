import * as vscode from 'vscode';
import { basename } from 'path';


export async function openResource(resource: vscode.Uri, position: number): Promise<void> {
    const editor = await vscode.window.showTextDocument(resource);
    const pos = editor.document.positionAt(position);
    editor.revealRange(new vscode.Range(pos, pos), vscode.TextEditorRevealType.InCenter);
    editor.selection = new vscode.Selection(pos, pos);
}

export function registerCommand(context: vscode.ExtensionContext, name: string, handler: (...args: any[]) => any) {
    context.subscriptions.push(vscode.commands.registerCommand(name, handler));
}


export class PinItem extends vscode.TreeItem {
    filename : string;
    filepath : string;
    constructor(filepath: string) {
        super(basename(filepath), vscode.TreeItemCollapsibleState.None);
        this.filepath = filepath;
        this.filename = basename(filepath);
        var uri = vscode.Uri.file(filepath);
        this.contextValue = '$Pin';
        this.command = new OpenFileCommand(uri);
    }
}

export interface PinItemCollection {
    [file: string]: Array<PinItem>;
}


export class PinItModel implements vscode.TreeDataProvider<PinItem> {
	private _onDidChangeTreeData: vscode.EventEmitter<PinItem | undefined> = new vscode.EventEmitter<PinItem | undefined>();
    readonly onDidChangeTreeData: vscode.Event<PinItem | undefined> = this._onDidChangeTreeData.event;
    workspaceState: vscode.Memento;

    getTreeItem(element: PinItem): vscode.TreeItem | Thenable<vscode.TreeItem> {
        return element;
    }

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

    getParent?(element: PinItem): vscode.ProviderResult<PinItem> {
        return null;
    }

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

    async Clearitems() {
        this.workspaceState.update("pins", []);
        this.refresh();
    }

    constructor(workspaceState: vscode.Memento) {
        this.workspaceState = workspaceState;
    }
}

class OpenFileCommand implements vscode.Command {
    command = 'extension.openFile';
    title = 'Open File';
    arguments?: any[];

    constructor(uri: vscode.Uri) {
        this.arguments = [uri];
    }
}

export class PinItController {

    constructor(private model: PinItModel) { }

    openFile(resource: vscode.Uri) {
        return openResource(resource, 0);
    }

    addPinItem() {
        var f =  vscode.window.activeTextEditor;
        var fsPath;
        if (!!f) {
            var item = new PinItem(f.document.uri.fsPath);
            return this.model.addItem(item);
        }
        
    }

    removePinItem(item: PinItem) {
        return this.model.removeItem(item);
    }

    clearPinItems() {
        return this.model.Clearitems();
    }

}

export function registerPinItView(context: vscode.ExtensionContext) {
    const pinItModel = new PinItModel(context.workspaceState);
    const pinItController = new PinItController(pinItModel);

    registerCommand(context, 'pinList.openEntry', pinItController.openFile.bind(pinItController));
    registerCommand(context, 'pinList.addEntry', pinItController.addPinItem.bind(pinItController));
    registerCommand(context, 'pinList.removeEntry', pinItController.removePinItem.bind(pinItController));
    registerCommand(context, 'pinList.clearAllEntry', pinItController.clearPinItems.bind(pinItController));
    context.subscriptions.push(vscode.window.registerTreeDataProvider('pinItExplorer', pinItModel));

    return pinItModel;
}
