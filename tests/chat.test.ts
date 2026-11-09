import assert from "node:assert/strict"
import { test } from "node:test"
import { chatLanguage, findFaqs } from "../src/chat.ts"

const faqs = [
  { id: "1", question: "1. ການປົກປ້ອງເງິນຝາກ ແມ່ນຫຍັງ?", answer: "Deposit protection" },
  { id: "2", question: "2. ວົງເງິນປົກປ້ອງ ແມ່ນຫຍັງ?", answer: "Coverage" },
  { id: "3", question: "What is DPO?", answer: "Deposit Protection Office" },
]
test("matches Lao questions without numbering, spacing or punctuation", () => {
  assert.equal(findFaqs("ວົງເງິນປົກປ້ອງແມ່ນຫຍັງ", faqs)[0]?.id, "2")
})
test("finds a topic in a typed question", () => {
  assert.equal(findFaqs("ວົງເງິນປົກປ້ອງເທົ່າໃດ", faqs)[0]?.id, "2")
  assert.equal(findFaqs(" DPO ", faqs)[0]?.id, "3")
})
test("returns choices for an ambiguous topic", () => {
  assert.equal(findFaqs("ປົກປ້ອງ", faqs).length, 2)
})
test("does not invent answers for missing, unrelated or empty questions", () => {
  for (const query of ["", "?", "a", "weather tomorrow", "<script>alert(1)</script>"]) assert.deepEqual(findFaqs(query, faqs), [])
  assert.deepEqual(findFaqs("DPO", []), [])
})

test("chat follows the question language without a language button", () => {
  assert.equal(chatLanguage("How do I contact DPO?"), "en")
  assert.equal(chatLanguage("ຕິດຕໍ່ DPO ໄດ້ແນວໃດ?"), "lo")
  assert.equal(chatLanguage("ສະບາຍດີ hello"), "lo")
})
