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
