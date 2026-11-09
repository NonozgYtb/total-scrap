export interface WoosmapResponse {
  type: string
  features: Feature[]
  pagination: Pagination
}

interface Feature {
  type: string
  properties: Properties
  geometry: Geometry
}

interface Properties {
  store_id: string
  name: string
  contact: Contact
  address: Address
  user_properties: UserProperties
  tags: string[]
  types: string[]
  last_updated: string
  distance: number
  open: Open
  weekly_opening: WeeklyOpening
  opening_hours: OpeningHours
}

interface Contact {
  email?: string
  phone?: string
  website: string
}

interface Address {
  lines: string[]
  country_code: string
  city: string
  zipcode: string
}

interface UserProperties {
  brand: string
  state: string
  status: string
  country: string
  poiType: string
  business: string
  contacts: Contacts
  iata_code: string
  puissance: string
  departement: string
  location_id: string
  managerName: any
  type_de_site: string
  exploite_pour: string
  mise_en_service: string
  caracteristiques: string
}

interface Contacts {
  first_tel: FirstTel
}

interface FirstTel {
  job: string
  name: string
  value?: string
}

interface Open {
  open_now: boolean
  open_hours: TimePeriod[]
  week_day: number
  next_opening?: NextOpening
  current_slice?: TimePeriod
}

interface NextOpening {
  day: string
  start: string
  end: string
}

interface WeeklyOpening {
  timezone: string
  "1": PeriodWithSpecial
  "2": PeriodWithSpecial
  "3": PeriodWithSpecial
  "4": PeriodWithSpecial
  "5": PeriodWithSpecial
  "6": PeriodWithSpecial
  "7": PeriodWithSpecial
}

interface PeriodWithSpecial {
  hours: TimePeriod[]
  isSpecial: boolean
}

interface OpeningHours {
  usual: Usual
  timezone: string
  temporary_closure?: any[]
}

interface Usual {
  "1"?: TimePeriod[]
  "2"?: TimePeriod[]
  "3"?: TimePeriod[]
  "4"?: TimePeriod[]
  "5"?: TimePeriod[]
  "6"?: TimePeriod[]
  "7"?: TimePeriod[]
  default?: TimePeriod[]
}

interface TimePeriod {
  end: string
  start: string
}

interface Geometry {
  type: string
  coordinates: number[]
}

interface Pagination {
  page: number
  pageCount: number
}
