const fs = require('fs')
const path = require('path')

const root = __dirname
const source = path.join(root, 'Cagimadu-Apresentacao.html')
const output = path.join(root, 'Cagimadu-Apresentacao-standalone.html')

let html = fs.readFileSync(source, 'utf8')
for (const file of ['blocos-live.png', 'fees-live.png', 'mercado.png']) {
  const image = fs.readFileSync(path.join(root, 'screenshots', file)).toString('base64')
  html = html.replaceAll(`screenshots/${file}`, `data:image/png;base64,${image}`)
}

fs.writeFileSync(output, html)
console.log(output)
