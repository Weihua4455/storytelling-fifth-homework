import * as d3 from 'd3'
import * as topojson from 'topojson'

let margin = { top: 0, left: 0, right: 0, bottom: 0 }

let height = 500 - margin.top - margin.bottom

let width = 900 - margin.left - margin.right

let svg = d3
  .select('#chart-1')
  .append('svg')
  .attr('height', height + margin.top + margin.bottom)
  .attr('width', width + margin.left + margin.right)
  .append('g')
  .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

let projection = d3.geoMercator()
let graticule = d3.geoGraticule()

let path = d3.geoPath().projection(projection)

var colorScale = d3.scaleSequential(d3.interpolateViridis).clamp(true)

Promise.all([
  d3.json(require('./data/world.topojson')),
  d3.csv(require('./data/world-cities.csv'))
])
  .then(ready)
  .catch(err => console.log('Failed on', err))

function ready([json, cities]) {
  // console.log(json.objects)
  // console.log(cities)

  let countries = topojson.feature(json, json.objects.countries)
  // console.log(countries)

  // let allPop = cities.map(d => +d.population)
  colorScale.domain([0, 1000000])
  // colorScale.domain(d3.extent(allPop))
  svg
    .selectAll('.country')
    .data(countries.features)
    .enter()
    .append('path')
    .attr('class', 'country')
    .attr('d', path)
    .attr('stroke', 'black')
    .attr('fill', 'black')

  svg
    .append('path')
    .datum(graticule())
    .attr('d', path)
    .attr('stroke', 'gray')
    .attr('fill', 'none')
    .lower()

  svg
    .append('rect')
    .attr('width', width)
    .attr('height', height)
    .attr('fill', 'black')
    .lower()

  svg
    .selectAll('.cities')
    .data(cities)
    .enter()
    .append('circle')
    .attr('class', 'cities')
    .attr('r', 1)
    .attr('transform', d => {
      // console.log(d)
      var coords = [d.lng, d.lat]
      // console.log(coords)
      return `translate(${projection(coords)})`
    })
    .attr('fill', d => colorScale(d.population))
}
