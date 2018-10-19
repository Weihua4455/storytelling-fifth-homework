import * as d3 from 'd3'

import * as turf from '@turf/turf'
import polylabel from 'polylabel'

var margin = { top: 0, left: 0, right: 0, bottom: 0 }
var height = 550 - margin.top - margin.bottom
var width = 700 - margin.left - margin.right

var svg = d3
  .select('#chart-3')
  .append('svg')
  .attr('height', height + margin.top + margin.bottom)
  .attr('width', width + margin.left + margin.right)
  .append('g')
  .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

let colorScale = d3.scaleSequential(d3.interpolateGnBu).domain([0, 10000])

Promise.all([
  d3.xml(require('./data/canada.svg')),
  d3.csv(require('./data/wolves.csv'))
])
  .then(ready)
  .catch(err => console.log('Failed on', err))

function ready([hexFile, datapoints]) {
  // console.log(hexFile)
  // console.log(datapoints)

  let imported = d3.select(hexFile).select('svg')

  // Remove the stylesheets Illustrator saved
  imported.selectAll('style').remove()

  // Inject the imported svg's contents into our real svg
  svg.html(imported.html())

  // Loop through our csv, finding the g for each state.
  // Use d3 to attach the datapoint to the group.
  // e.g. d3.select("#" + d.abbr) => d3.select("#CA")
  datapoints.forEach(d => {
    svg
      .select('#' + d.abbreviation)
      .attr('class', 'hex-group')
      .each(function() {
        d3.select(this).datum(d)
        // svg.selectAll('.hex-group').each(function(d) {
        //   var group = d3.select(this)
        //   group.selectAll('polygon').attr('fill', d => colorScale(d.wolves))
        // })
      })
  })

  svg.selectAll('.hex-group').each(function(d) {
    var group = d3.select(this)
    group
      .selectAll('polygon')
      .attr('fill', colorScale(d.wolves))
      .attr('class', d.abbreviation)
  })
}
