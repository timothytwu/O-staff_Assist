const courseFind = require('./courseFind');

const DeAnza = '113';
const Foothill = '51';
const Department = "MATH Mathematics";
const Code = "1A";

function testGEReport() {
    const list = require('./demoArticulations/fullGEReport.json');
    console.log(list);   
}

(async () => {
    //return testGEReport();
    let thing = await courseFind(DeAnza, Department, Code);

    console.log(thing);
})();
