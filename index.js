var moment = require('moment');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const conf = require(__dirname + '/conf.json')

const FORMAT = 'DD/MM/YYYY HH:mm:ss'
const argv = process.argv.slice(2)


const month = Number(argv[0]) - 1
const year = Number(argv[1]) || moment().year()

if (!moment({year, month}).isValid()) {
    console.log('Usage: node index.js month [year]')
    console.log('* month: 1-12')
    console.log('* year: optional, default value: current')
    console.log('\nmodify conf.json to your needs')
    return
}

const addMYToFilename = (filename, m, y) => {
  const arr = filename.split('.')
  const ext = arr.pop()
  return `${arr.join('')}_${y}_${m + 1}.${ext}`
}

const csvWriter = createCsvWriter({
  path: addMYToFilename(conf.outputFileName, month, year),
  header: [...conf.header]
});

const data = []
const current = moment({ year, month, day: 1, hour: conf.startHour, minute: conf.startMin, second: 0, millisecond: 0})

while (true) {

    if (current.month() !== month) {
        break
    }
    if ([0, 6].includes(current.day())) {
        current.add(24, 'hours')
        continue
    }

    const dayEnd = moment(current).add(conf.hours * 60, 'minutes')

    data.push({
        ...conf.prefilledValues,
        start: current.format(FORMAT),
        end: dayEnd.format(FORMAT),
        duration: dayEnd.diff(current, 'minutes'),
        dauerInStunden: (dayEnd.diff(current, 'minutes') / 60).toLocaleString('de-AT'),
    })

    current.add(24, 'hours')
}

console.log({data})

csvWriter
  .writeRecords(data)
  .then(() => console.log('\nTimesheet file was written successfully'))
  .catch(() => console.log('\nError writing file, make sure it is not open'))
