import * as assert from 'assert';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
import * as path from 'path';

//import * as myExtension from '../pinItExtension.ts';
import { openResource } from '../../extension';

const testFolderPath = "../../../../src/test/examples/";

function sleep(ms: number): Promise<void> {
	return new Promise(resolve => {
	  setTimeout(resolve, ms);
	});
}

suite('openResource tests', () => {
	//vscode.window.showInformationMessage('Start all tests.');

	test('should open resource at position 0', async () => {
		const uri = vscode.Uri.file( //create example resource
			path.join(__dirname + testFolderPath + 'exampleResource.txt')
		);

		const position = 0;
		await openResource(uri, position);
		const editor = vscode.window.activeTextEditor;
		assert.notEqual(editor,undefined);
		if (editor) {
			assert.equal(editor.document.uri.fsPath , uri.fsPath);
		}
		
		vscode.commands.executeCommand('workbench.action.closeActiveEditor');
	});

});


suite('registerCommand tests', () => {

	test('should register example command', () => {
		assert.equal(-1, [1, 2, 3].indexOf(5));
		assert.equal(-1, [1, 2, 3].indexOf(0));
	});
});

suite('PinItModel tests', () => {

	test('Sample test', () => {
		assert.equal(-1, [1, 2, 3].indexOf(5));
		assert.equal(-1, [1, 2, 3].indexOf(0));
	});
});

suite('PinItController tests', () => {

	test('Sample test', () => {
		assert.equal(-1, [1, 2, 3].indexOf(5));
		assert.equal(-1, [1, 2, 3].indexOf(0));
	});
});