const { writeFileSync } = require('fs');

fetch('https://assist.org/api/institutions').then(res => res.json()).then(collegeData => {
    writeFileSync('./demoArticulations/collegeList.json', JSON.stringify(collegeData.filter(e => e.isCommunityCollege)));
});
