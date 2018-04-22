declare var JsDiff: any;

function loadFiles(...names: string[]) {
	return Promise
		.all(names.map(name => fetch(`../test/data/${name}`)))
		.then(results => {
			if (!results.every((result) => result.ok)) {
				throw new Error("Failed to receive files from local server.");
			}
			return Promise.all(results.map(result => result.text()))
		})
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
		
		return new Error(output);
	}
}

loadFiles("../list.json").then(([list]) => {
	describe("Conversion diff test", function () {
		for (var item of <string[]>JSON.parse(list)) {
			describe(`${item}.smi`, function () {
				this.timeout(0);
				let tempStorage = {
					smiDoc: <SamiTS.SAMIDocument>null,
					vtt: <string>null,
					srt: <string>null,
					prepare(name: string) {
						if (this.smiDoc) {
							return Promise.resolve();
						}
						return loadFiles(`${item}.smi`, `${item}.vtt`, `${item}.srt`)
							.then(([smi, vtt, srt]) => {
								this.vtt = vtt;
								this.srt = srt;
								return SamiTS.createSAMIDocument(smi);
							})
							.then((smiDoc) => {
								this.smiDoc = smiDoc;
							});
					}
				}				
				beforeEach(() => tempStorage.prepare("subject"));
				
				it("should be same as test WebVTT file", (done) => {
					return SamiTS.createWebVTT(tempStorage.smiDoc)
						.then((result) => {
							done(assertDiff(tempStorage.vtt, result.subtitle.replace(/\r\n/g, "\n")))
						})
						.catch(done);
				});
				it("should be same as test SubRip file", (done) => {
					return SamiTS.createSubRip(tempStorage.smiDoc, { useTextStyles: true })
						.then((result) => {
							done(assertDiff(tempStorage.srt, result.subtitle.replace(/\r\n/g, "\n")))
						})
						.catch(done);
				})
			});
		}
	});
	
	mocha.run();
}).catch((err) => console.error(err));
	
