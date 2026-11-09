import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { gsap } from 'gsap'

const assets = JSON.parse(readFileSync(new URL('../src/data/assets.json', import.meta.url)))
const source = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8')
const targets = [...source.matchAll(/data-count-target="(\d+)"/g)].map((match) => Number(match[1]))
assert.deepEqual(targets, [100, 35, 6])

// Exercise GSAP's real integer interpolation and cleanup, without a browser.
const counters = targets.map((target) => ({ textContent: target, target }))
let tween
const context = gsap.context(() => {
  tween = gsap.fromTo(counters, { textContent: 0 }, {
    textContent: (_index, counter) => counter.target,
    snap: { textContent: 1 }, duration: 1.8, ease: 'power2.out', paused: true,
  })
})
tween.progress(0)
assert.deepEqual(counters.map((counter) => Number(counter.textContent)), [0, 0, 0])
tween.progress(0.5)
for (const counter of counters) {
  assert(Number.isInteger(Number(counter.textContent)))
  assert(Number(counter.textContent) > 0 && Number(counter.textContent) <= counter.target)
}
tween.progress(1)
assert.deepEqual(counters.map((counter) => Number(counter.textContent)), targets)
context.revert()
assert.deepEqual(counters.map((counter) => Number(counter.textContent)), targets)

const localFiles = [...new Set(Object.entries(assets)
  .filter(([id, asset]) => /^(home|shared|footer)\./.test(id) && asset.kind !== 'map')
  .map(([, asset]) => asset.src))]
for (const file of localFiles) {
  const response = await fetch(`${process.env.DPO_API_ORIGIN || "http://localhost:3000"}${file}`, { method: "HEAD" })
  assert.equal(response.status, 200, file)
  assert(Number(response.headers.get("content-length")) > 0, file)
}
assert.equal(new Set(Array.from({ length: 5 }, (_, i) => assets[`home.hero-${i + 1}`].src)).size, 5)
console.log(`Passed: 3 integer counters, GSAP cleanup, 5 banner files, ${localFiles.length} API Home/shared/footer assets.`)
