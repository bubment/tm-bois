const convert = require('xml-js');

function parseXML(xml) {
    return convert.xml2js(xml, { compact: true, spaces: 4 });
};

module.exports = { parseXML };