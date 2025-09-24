// https://assist.org/api/agreements?receivingInstitutionId=128&sendingInstitutionId=86&academicYearId=74&categoryCode=dept
const UCSB = '128';

const geFinder = (cc, dept, code) => new Promise(async (res, rej) => {
    let { reports } = await fetch(`https://assist.org/api/agreements?receivingInstitutionId=${UCSB}&sendingInstitutionId=${cc}&academicYearId=74&categoryCode=breadth`).then(res => res.json());
    let { key } = reports.find(e => e.label == "College of Letters and Science General Education Requirements");
    let { result } = await fetch(`https://assist.org/api/articulation/Agreements?Key=${key}`).then(res => res.json());
    let GEs = JSON.parse(result.articulations);
    
    res(
        GEs.filter(area => 
            area.articulation.sendingArticulation.items.find(e => 
                `${e.items[0].prefix} ${e.items[0].department}` == dept && e.items[0].courseNumber == code
            )
        ).map(e => e.articulation.generalEducationArea.code)
    );
});

const getDepartmentArticulations = (cc, dept) => new Promise(async (res, rej) => {
    //Get list of departments at college
    let { reports } = await fetch(`https://assist.org/api/agreements?receivingInstitutionId=${UCSB}&sendingInstitutionId=${cc}&academicYearId=74&categoryCode=prefix`).then(res => res.json());

    let deptKey = reports.find(e => e.ownerInstitutionId == cc && e.label == dept)?.key;
    if(!deptKey) throw new Error("Unable to find entered department at community college");

    let { result } = await fetch(`https://assist.org/api/articulation/Agreements?Key=${deptKey}`).then(res => res.json());

    res(JSON.parse(result.articulations));
});

const CourseFinder = (data, code) => [
    ...data.filter(agreement => 
        agreement.sendingArticulation?.items.find(group => 
            group.items.find(e => 
                code == e.courseNumber
            )
        )
    )
];

module.exports = (CC, Department, Code) => new Promise(async (res, rej) => {
    let articulations = await getDepartmentArticulations(CC, Department);

    //fs.writeFileSync('./tests/resultMath.json', JSON.stringify(articulations))
    
    /** List of agreements including searched for course */
    let foundArticulations = CourseFinder(articulations, Code);    

    foundArticulations = foundArticulations.map(agreement => {
        let equiv = {
            ucsb: '',
            cc: agreement.sendingArticulation.items
                .map(e1 => 
                    e1 = e1.items
                    .map(e2 => `${e2.prefix} ${e2.courseNumber}`)
                    .sort((a, b) => b-a)
                    .join(` ${e1.courseConjunction.toLowerCase()} `)
                //Just assume they're all ors because conjunction handling is shit and i dont want to deal with it
                ).join(agreement.sendingArticulation.courseGroupConjunctions.length > 0
                    ? ' or ' : ' and '
                )
        };

        if(agreement.type == 'Course') equiv.ucsb = `${agreement.course.prefix} ${agreement.course.courseNumber}`;
        if(agreement.type == 'Series') equiv.ucsb = agreement.series.name;

        return equiv;
    });

    geFinder(CC, Department, Code);

    res({
        courseName,
        GEAreas: await geFinder(CC, Department, Code),
        foundArticulations
    })
});
