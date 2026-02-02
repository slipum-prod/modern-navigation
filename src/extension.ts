import * as vscode from 'vscode';
import { navigate } from './navigation';

function shouldUseModernNavigation(
	document: vscode.TextDocument | undefined,
	config: vscode.WorkspaceConfiguration,
): boolean {
	const extensions = config.get<string[]>('fileExtensions', []);
	if (extensions.length === 0) return true;
	const fileName = (document?.fileName ?? '').split('/').pop() ?? '';
	return extensions.some((ext) => {
		const suffix = ext.startsWith('*') ? ext.slice(1) : ext.startsWith('.') ? ext : '.' + ext;
		return fileName.toLowerCase().endsWith(suffix.toLowerCase());
	});
}

function executeNavigation(direction: 'left' | 'right') {
	const editor = vscode.window.activeTextEditor;
	const config = vscode.workspace.getConfiguration('modernNavigation');

	if (editor && editor.document) {
		if (!shouldUseModernNavigation(editor.document, config)) {
			vscode.commands.executeCommand(
				direction === 'right' ? 'cursorWordEndRight' : 'cursorWordStartLeft',
			);
			return;
		}
		const selection = editor.selection;
		const position = selection.active;
		const line = editor.document.lineAt(position.line);
		const text = line.text;
		const targetPos = navigate(text, position.character, direction);
		if (targetPos !== null) {
			editor.selection = new vscode.Selection(position.line, targetPos, position.line, targetPos);
			editor.revealRange(editor.selection);
		} else {
			vscode.commands.executeCommand(
				direction === 'right' ? 'cursorWordEndRight' : 'cursorWordStartLeft',
			);
		}
	} else {
		vscode.commands.executeCommand(
			direction === 'right' ? 'cursorWordEndRight' : 'cursorWordStartLeft',
		);
	}
}

export function activate(context: vscode.ExtensionContext) {
	context.subscriptions.push(
		vscode.commands.registerCommand('modernNavigation.left', () => executeNavigation('left')),
	);
	context.subscriptions.push(
		vscode.commands.registerCommand('modernNavigation.right', () => executeNavigation('right')),
	);
}

export function deactivate() {}
