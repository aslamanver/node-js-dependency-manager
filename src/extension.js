const vscode = require('vscode');

function activate(context) {

	console.log('Congratulations, your extension "node-js-dependency-viewer" is now active!');

	let command = vscode.commands.registerCommand('extension.node-js-dependency-viewer', function () {

		vscode.window.createWebviewPanel('vsc-extension', 'Title', vscode.ViewColumn.One, {});

	});

	context.subscriptions.push(command);
}

exports.activate = activate;

function deactivate() { }

module.exports = {
	activate,
	deactivate
}
