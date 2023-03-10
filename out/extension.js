"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const fs = require("fs");
const path = require("path");
const vscode = require("vscode");
let terminal = vscode.window.createTerminal({ name: 'Node.js Dependencies', hideFromUser: true });
const configuration = (name) => vscode.workspace.getConfiguration().get(name);
let mContext;
let mPanel;
let isVisible = false;
function activate(context) {
    mContext = context;
    console.log('Congratulations, your extension "node-js-dependency-manager" is now active!');
    welcomeAction();
    const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    statusBarItem.command = 'extension.node-js-dependency-manager';
    statusBarItem.text = "$(zap) Node.js Dependencies";
    statusBarItem.tooltip = 'Open Node.js dependencies manager from package.json file';
    statusBarItem.show();
    const command = vscode.commands.registerCommand('extension.node-js-dependency-manager', function () {
        if (!fs.existsSync(path.join(`${vscode.workspace.rootPath}`, 'package.json'))) {
            vscode.window.showErrorMessage('package.json file does not exist in this directory!');
            return;
        }
        if (isVisible)
            return;
        mPanel = vscode.window.createWebviewPanel('nodejs-extension', 'Please wait..', vscode.ViewColumn.One, {
            enableScripts: true,
            localResourceRoots: [
                vscode.Uri.file(path.join(context.extensionPath, 'resources')),
                vscode.Uri.file(`${vscode.workspace.rootPath}`)
            ]
        });
        mPanel.webview.html = addHTML();
        mPanel.webview.onDidReceiveMessage((message) => {
            switch (message.command) {
                case 'loaded':
                    mPanel.title = 'Node.js Dependency Manager';
                    return;
                case 'add':
                    if (configuration('nodejs-dm.showTerminal'))
                        terminal.show();
                    terminal.sendText('npm install -s ' + message.text);
                    return;
                case 'remove':
                    if (configuration('nodejs-dm.showTerminal'))
                        terminal.show();
                    terminal.sendText('npm uninstall ' + message.text);
                    return;
                case 'npminstall':
                    if (configuration('nodejs-dm.showTerminal'))
                        terminal.show();
                    terminal.sendText('npm install ' + message.text);
                    return;
            }
        });
        isVisible = true;
        mPanel.onDidDispose(() => {
            isVisible = false;
        });
        vscode.window.onDidCloseTerminal((t) => {
            if (t.name === 'Node.js Dependencies') {
                terminal = vscode.window.createTerminal({ name: 'Node.js Dependencies', hideFromUser: true });
            }
        });
    });
    // context.subscriptions.push(vscode.window.onDidChangeActiveTextEditor(() => {
    // 	statusBarItem.show();
    // }));
    context.subscriptions.push(statusBarItem);
    context.subscriptions.push(command);
}
exports.activate = activate;
function welcomeAction() {
    const globalStorage = mContext.globalStoragePath;
    const welcomePath = path.join(mContext.globalStoragePath, 'welcome');
    fs.exists(welcomePath, (e) => {
        if (!e) {
            vscode.window.showInformationMessage('You can now manage Node.js dependencies through Node.js Dependency Manager extension');
            vscode.commands.executeCommand('extension.node-js-dependency-manager');
            fs.exists(globalStorage, exists => {
                if (!exists) {
                    fs.mkdir(globalStorage, (err) => {
                        if (err)
                            throw err;
                        fs.writeFile(welcomePath, "1", (err) => {
                            if (err)
                                throw err;
                        });
                    });
                }
                else {
                    fs.writeFile(welcomePath, "1", (err) => {
                        if (err)
                            throw err;
                    });
                }
            });
        }
    });
}
function deactivate() {
    //
}
exports.deactivate = deactivate;
function addHTML() {
    return `
		<!doctype html>
		<html lang="en">
		
		<head>
			<meta charset="utf-8">
			<meta http-equiv="X-UA-Compatible" content="IE=edge">
			<meta name="viewport" content="width=device-width, initial-scale=1.0, minimum-scale=1.0">
			<title>Node.js Dependency Manager</title>
			
			<link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons">

			<!--
			<link rel="stylesheet" href="https://code.getmdl.io/1.3.0/material.indigo-pink.min.css">
			<script defer src="https://code.getmdl.io/1.3.0/material.min.js"></script>
			<script src="https://ajax.googleapis.com/ajax/libs/jquery/3.4.1/jquery.min.js"></script>
			<link rel="stylesheet" href="${getFileUri('material.indigo-pink.min.css')}">
			<script defer src="${getFileUri('material.min.js')}"></script>
			-->

			<script src="${getFileUri('jquery.min.js')}"></script>
			<link rel="stylesheet" href="${getFileUri('style.css')}">
			<script src="${getFileUri('script.js')}"></script>
		</head>
		
		<body>

			<input type="hidden" id="package-json-uri" value="${getHostFileUri('package.json')}">

			<div class="flex-h-center">
		
				<div class="body-container">
		
					<button onclick="clearSearch()" class="sync-btn ripple">
						<i class="material-icons">sync</i> SYNC
					</button>

					<button onclick="npmInstall()" class="sync-btn ripple">
						<i class="material-icons">download</i> NPM INSTALL
					</button>
		
					<div class="dependency-search">
						<input onkeyup="npmFind(this)" id="dependency-input" type="text" class="dependency-input"
							placeholder="Search keyword..." />
						<div onclick="clearSearch()" class="dependency-btn dependency-search-clear-btn" id="dependency-search-clear-btn">
							<i class="material-icons">clear</i>
						</div>
					</div>
		
					<div class="dependency-count" id="dependency-count">
						...
					</div>
		
					<div class="dependency-list" id="dependency-list">
		
						<div class="dependency-card">
		
							Sample <span class="version">^7.1.6</span>
		
							<div class="dependency-description">
		
								Lorem ipsulum bajali new man from
		
								<div class="other-info">
									<img onerror="this.style.display='none'" src="https://img.shields.io/npm/dm/glob.svg" />
									<img onerror="this.style.display='none'" src="https://img.shields.io/npm/v/glob.svg">
								</div>
							</div>
		
							<div class="manage-btns">
								<div onclick="managePackage(this, 'name', 'remove')" class="dependency-btn">
									<i class="material-icons">clear</i>
								</div>
							</div>
		
						</div>
		
					</div>
		
				</div>
		
			</div>
		
		</body>
		
		</html>`;
}
function getFileUri(name) {
    const file = vscode.Uri.file(path.join(mContext.extensionPath, 'resources', name));
    return mPanel.webview.asWebviewUri(file);
}
function getHostFileUri(name) {
    const file = vscode.Uri.file(path.join(`${vscode.workspace.rootPath}`, name));
    return mPanel.webview.asWebviewUri(file);
}
//# sourceMappingURL=extension.js.map