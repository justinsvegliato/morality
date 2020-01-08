const table = require('table').table;

function print(data) {
  const formattedData = [];

  for (const row of data) {
    const formattedRow = [];
    for (const cell of row) {
      formattedRow.push(isNaN(cell) ? cell : Math.abs(cell).toFixed(2));
    }
    formattedData.push(formattedRow);
  }

  console.log(table(formattedData));
}

module.exports = {
  print
};
