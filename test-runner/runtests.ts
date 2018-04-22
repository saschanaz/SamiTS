declare var JsDiff: any;

async function loadFiles(...names: string[]) {
	const results = await Promise.all(names.map(name => fetch(`../test/data/${name}`)));
	if (!results.every(result => result.ok)) {
		throw new Error("Failed to receive files from local server.");
	}
	return Promise.all(results.map(result => result.text()))
}

function assertDiff(first: string, second: string) {
	let diffs = JsDiff.structuredPatch("", "", first, second);
	
	if (diffs.hunks.length) {
		let output = `${diffs.hunks.length} diff hunks found.\r\n\r\n`;
		for (let hunk of diffs.hunks) {
			output += `@@ -${hunk.oldStart},${hunk.oldLines} +${hunk.newStart},${hunk.newLines} @@\r\n`;
			for (let line of hunk.lines) {
				output += line + "\r\n";
			}
			output += "\r\n";
		}
		
		throw new Error(output);
	}
}

function assertDiffLinebreakSafe(first: string, second: string) {
	assertDiff(first.replace(/\r\n/g, "\n"), second.replace(/\r\n/g, "\n"));
}

loadFiles("../list.json").then(([list]) => {
	describe("Conversion diff test", function () {
		for (const item of JSON.parse(list) as string[]) {
			describe(`${item}.smi`, function () {
				this.timeout(0);
				const tempStorage = {
					smiDoc: <SamiTS.SAMIDocument>null,
					vtt: <string>null,
					srt: <string>null,
					async prepare(name: string) {
						if (this.smiDoc) {
							return;
						}
						const [smi, vtt, srt] = await loadFiles(`${name}.smi`, `${name}.vtt`, `${name}.srt`);	
						this.vtt = vtt;
						this.srt = srt;
						this.smiDoc = await SamiTS.createSAMIDocument(smi);
					}
				}				
				beforeEach(() => tempStorage.prepare(item));
				
				it("should be same as test WebVTT file", async () => {
					const result = await SamiTS.createWebVTT(tempStorage.smiDoc)
					assertDiffLinebreakSafe(tempStorage.vtt, result.subtitle);
				});
				it("should be same as test SubRip file", async () => {
					const result = await SamiTS.createSubRip(tempStorage.smiDoc, { useTextStyles: true });
					assertDiffLinebreakSafe(tempStorage.srt, result.subtitle);
				})
			});
		}
	});
	
	mocha.run();
}).catch(console.error);
	
