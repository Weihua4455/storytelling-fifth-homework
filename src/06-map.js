import * as d3 from 'd3'
import * as topojson from 'topojson'

let margin = { top: 0, left: 0, right: 0, bottom: 0 }

let height = 200 - margin.top - margin.bottom

let width = 300 - margin.left - margin.right

let container = d3.select('#chart-6')

let projection = d3.geoAlbersUsa()

let path = d3.geoPath().projection(projection)

let radiusScale = d3.scaleSqrt().range([0, 5])

var colorScale = d3.scaleOrdinal(d3.schemeSet1)

var yPositionScale = d3.scaleBand().range([100, 500])

Promise.all([
  d3.json(require('./data/us_states.topojson')),
  d3.csv(require('./data/powerplants.csv'))
])
  .then(ready)
  .catch(err => console.log('Failed on', err))

function ready([usStates, powerplants]) {
  // console.log(json.objects)

  let states = topojson.feature(usStates, usStates.objects.us_states)

  let mws = powerplants.map(d => d.Total_MW)
  radiusScale.domain([0, d3.max(mws)])

  let powerplantTypes = powerplants.map(d => d.PrimSource)

  let types = d3.set(powerplantTypes).values()
  colorScale.domain(d3.extent(types))
  yPositionScale.domain(types)

  // console.log(states)
  projection.fitSize([width, height], states)

  var nested = d3
    .nest()
    .key(function(d) {
      return d.PrimSource
    })
    .entries(powerplants)

  // console.log(nested)
  container
    .selectAll('source-graphs')
    .data(nested)
    .enter()
    .append('svg')
    .attr('height', height + margin.top + margin.bottom)
    .attr('width', width + margin.left + margin.right)
    .append('g')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
    .each(function(d) {
      var svg = d3.select(this)
      // console.log(d)

      svg
        .selectAll('.states')
        .data(states.features)
        .enter()
        .append('path')
        .attr('class', 'states')
        .attr('d', path)
        .attr('stroke', 'white')
        .attr('fill', 'lightgray')

      svg
        .selectAll('.powerplants')
        .data(d.values)
        .enter()
        .append('circle')
        .attr('class', 'powerplants')
        .attr('r', d => radiusScale(d.Total_MW))
        .attr('transform', d => {
          // console.log(d)
          var coords = [d.Longitude, d.Latitude]
          // console.log(coords)
          return `translate(${projection(coords)})`
        })
        .attr('fill', d => colorScale(d.PrimSource))
        .attr('opacity', '0.5')

      svg
        .append('text')
        .text(d.key)
        .attr('font-weight', '600')
        .attr('text-anchor', 'middle')
        .attr('alignment-baseline', 'middle')
        .attr('transform', `translate(${width / 2}, ${height / 2})`)
    })

  // console.log(us_states.objects)
}
