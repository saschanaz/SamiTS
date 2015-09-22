declare var diff_match_patch: any;

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
	let dmp = new diff_match_patch();
	let diff = dmp.diff_main(first, second);
	
	if (diff.length > 2) {
		dmp.diff_cleanupSemantic(diff);
	}
	
	let patchList = dmp.patch_make(first, second, diff);
	let patchText = dmp.patch_toText(patchList);
	
	if (patchText) {
		return new Error(decodeURI(patchText));
	}
}

describe("Conversion diff test", function () {
	this.timeout(5000);
	
	it("should be same as result file", (done) => {
		let vtt: string;
		return loadFiles("subject.smi", "subject.vtt")
			.then(([smi, _vtt]) => {
				vtt = _vtt;
				return SamiTS.createWebVTT(smi);
			})
			.then((result) => {
				done(assertDiff(result.subtitle.replace(/\r\n/g, "\n"), vtt)) 
			})
			.catch(done);
	});
});