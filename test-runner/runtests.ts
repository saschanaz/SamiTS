var assert = chai.assert;

function loadFiles(...names: string[]) {
	return Promise
		.all(names.map(name => fetch(`../test/data/${name}`)))
		.then(results => Promise.all(results.map(result => result.text())))
}

describe("Conversion diff test", function () {
	this.timeout(10000);
	
	it("should be same as result file", (done) => {
		let vtt: string;
		loadFiles("subject.smi", "subject.vtt")
			.then(([smi, _vtt]) => {
				vtt = _vtt;
				return SamiTS.createWebVTT(smi);
			})
			.then((result) => {
				assert.equal(result.subtitle.replace(/\r\n/g, "\n"), vtt, "Differences are found.");
				done();
			})
			.catch(done)
	});
});