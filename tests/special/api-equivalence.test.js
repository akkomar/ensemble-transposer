const chai = require('chai');
const deepEqualInAnyOrder = require('deep-equal-in-any-order');

const utils = require('../utils');

chai.use(deepEqualInAnyOrder);


it('Local API output is equivalent to production API output', function(done) {
    this.timeout(50000);

    async function compare() {
        const datasetNames = utils.getDatasetNames();

        for (const datasetName of datasetNames) {

            for (const platform of await utils.getPlatforms(datasetName)) {
                const localSummary = await utils.getLocalJSON(`${platform}/${datasetName}`);
                const productionSummary = await utils.getProductionJSON(`${platform}/${datasetName}`);

                chai.expect(productionSummary).to.deep.equalInAnyOrder(localSummary);

                // The order of the dates *does* matter
                chai.expect(productionSummary.dates).to.deep.equal(localSummary.dates);

                for (const categoryName of localSummary.categories) {
                    for (const metricName of localSummary.metrics) {
                        const metricPath = `${platform}/${datasetName}/${categoryName}/${metricName}`;
                        const localMetric = await utils.getLocalJSON(metricPath, platform);
                        const productionMetric = await utils.getProductionJSON(metricPath, platform);
                        chai.expect(productionMetric).to.deep.equalInAnyOrder(localMetric);
                    }
                }
            }
        }
    }

    compare().then(done).catch(done);
});
