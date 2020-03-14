// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { registerPinItView } from './pinItExplore';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	const view = registerPinItView(context);
	//context.workspaceState.update("pins",["extension.ts","pinItExplore.ts"]);
	//var pins = context.workspaceState.get("pins");
	/*
	if (!!context.storagePath) {
		stat(context.storagePath, (exists) => {
			if (exists === null) {
				return true;
			} else if (exists.code === 'ENOENT') {
				return false;
			}
		});

	}*/

	//const configuration = vscode.workspace.getConfiguration("pinIt.settings");
	//configuration.update("pins", ["extension.ts","pinItExplore.ts"]);
	///var pins = configuration.get("pins");
	//const view = registerPinItView(context, model);

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "pinit" is now active!');
	
	//vscode.commands.registerCommand('extension.pinIt', pinItExplore);

	//context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}
