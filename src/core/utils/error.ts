export function handleFatalError(message: string, error: any) {
	handleError(message, error);
	process.exit(1);
}

export function handleError(message: string, error: any) {
	console.error((new Date()).toLocaleString());
	console.error('❌ ', message);
	console.error(error);
}