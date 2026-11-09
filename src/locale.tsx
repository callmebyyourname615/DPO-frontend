import { createContext, useContext, useEffect, useState, type ReactNode } from "react"

type Locale = "lo" | "en"
const english: Record<string, string> = {
  "ໜ້າຫຼັກ": "Home", "ກ່ຽວກັບ ສປງ": "About DPO", "ພາລະບົດບາດ ແລະ ໜ້າທີ່": "Roles and Responsibilities", "ປະຫວັດຄວາມເປັນມາ": "Our History", "ໂຄງຮ່າງການຈັດຕັ້ງ": "Organization", "ໂຄງຮ່າງການຈັດຕັ້ງ ສະພາບໍລິຫານ": "Board of Directors", "ໂຄງຮ່າງການຈັດຕັ້ງ ສາຍພັກ ແລະ ອົງການຈັດຕັ້ງມະຫາຊົນ": "Party and Mass Organizations", "ໂຄງຮ່າງການຈັດຕັ້ງ ສາຍລັດ": "Organizational Structure",
  "ນິຕິກຳ": "Legislation", "ດຳລັດ": "Decrees", "ຂໍ້ຕົກລົງ": "Agreements", "ແຈ້ງການ": "Notices", "ແບບພິມ": "Forms", "ບົດແນະນໍາ ແລະ ຄໍາແນະນໍາ": "Guidelines", "ຮ່ວມມືສາກົນ": "International Cooperation", "ການຮ່ວມມືສາກົນ": "International Cooperation", "ການຮ່ວມມືສອງຝ່າຍ": "Bilateral Cooperation", "ການເຄື່ອນໄຫວວຽກງານຮ່ວມມືສາກົນ": "International Cooperation Activities", "ຂ່າວສານ": "News", "ຕິດຕໍ່": "Contact", "ຄຳຖາມທີ່ພົບເລື້ອຍ": "Frequently Asked Questions", "ເຊື່ອມຕໍ່": "Links", "ຂໍ້ມູນ": "Information",
}
const LocaleContext = createContext<{ locale: Locale; setLocale: (locale: Locale) => void }>({ locale: "lo", setLocale: () => {} })
export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>(() => {
    try { return localStorage.getItem("dpo-locale") === "en" ? "en" : "lo" } catch { return "lo" }
  })
  useEffect(() => {
    try { localStorage.setItem("dpo-locale", locale) } catch { /* Continue when storage is unavailable. */ }
  }, [locale])
  return <LocaleContext.Provider value={{ locale, setLocale }}>{children}</LocaleContext.Provider>
}
export function useLocale() {
  const context = useContext(LocaleContext)
  return { ...context, t: (value: string) => context.locale === "en" ? english[value] ?? value : value }
}

export const chatCopy = {
  lo: {
    title: "ສອບຖາມ ສປງ", subtitle: "ຄຳຕອບຈາກຂໍ້ມູນເວັບ DPO",
    greeting: "ສະບາຍດີ! ຖາມກ່ຽວກັບ ສປງ, ການປົກປ້ອງເງິນຝາກ, ສະມາຊິກ, ຂ່າວສານ ຫຼື ການຕິດຕໍ່ໄດ້. ຄຳຕອບມີແຫຼ່ງຂໍ້ມູນໃຫ້ກວດສອບ.",
    close: "ປິດ", openChat: "ເປີດການສົນທະນາ", closeChat: "ປິດການສົນທະນາ", history: "ປະຫວັດການສົນທະນາ",
    search: "ຄົ້ນຫາຂໍ້ມູນເວັບ DPO", sources: "ແຫຼ່ງຂໍ້ມູນ", excerpt: "ເບິ່ງຂໍ້ຄວາມອ້າງອີງ", laoSource: "ແຫຼ່ງຂໍ້ມູນພາສາລາວ",
    pending: "ກຳລັງຄົ້ນຫາຄຳຕອບ...", error: "ບໍ່ສາມາດສົ່ງຄຳຖາມໄດ້. ກະລຸນາລອງໃໝ່ ຫຼື ເລືອກ FAQ ດ້ານລຸ່ມ.",
    suggestionsLoading: "ກຳລັງໂຫຼດຄຳຖາມແນະນຳ...", suggestionsError: "ບໍ່ສາມາດໂຫຼດຄຳຖາມແນະນຳໄດ້. ທ່ານຍັງພິມຄຳຖາມໄດ້.",
    notice: "ຄຳຕອບອ້າງອີງຈາກຂໍ້ມູນທີ່ເຜີຍແຜ່ໃນເວັບ DPO. ", contact: "ຕິດຕໍ່ ສປງ →",
    placeholder: "ພິມຄຳຖາມຂອງທ່ານ...", question: "ຄຳຖາມຂອງທ່ານ", send: "ສົ່ງຄຳຖາມ", suggestion: "ຄຳຖາມແນະນຳ", viewAnswer: "ເບິ່ງຄຳຕອບ",
  },
  en: {
    title: "Ask DPO", subtitle: "Answers from the DPO website",
    greeting: "Hello! Ask me about DPO, deposit protection, member institutions, news or contact details. Answers include sources you can check.",
    close: "Close", openChat: "Open chat", closeChat: "Close chat", history: "Conversation history",
    search: "DPO website search", sources: "Sources", excerpt: "View source excerpt", laoSource: "Source available in Lao",
    pending: "Finding an answer…", error: "Could not send your question. Please retry or select a FAQ below.",
    suggestionsLoading: "Loading suggested questions…", suggestionsError: "Suggested questions are unavailable. You can still type your question.",
    notice: "English FAQs use prepared translations. Source pages and news may be in Lao. ", contact: "Contact DPO →",
    placeholder: "Type your question…", question: "Your question", send: "Send question", suggestion: "Suggested question", viewAnswer: "View answer",
  },
}
