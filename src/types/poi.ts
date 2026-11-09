export interface PoiResponse {
  location_id: string
  business_name: string
  brand_code: string
  brand_name: string
  contractual_name: string
  code_iata: any
  code_icao: any
  type: string
  current_business_opening_status_code: string
  mobile: any
  mail: any
  web_site: string
  street_address: string
  zip_code: string
  city: string
  country: string
  region: string
  side_of_the_road: any
  automate_24: string
  latitude: number
  longitude: number
  landline_phone: string
  phone_number_main: any
  phone_number_secondary: any
  x_twitter_url: any
  instagram_url: any
  facebook_url: any
  current_business_opening_hour_period: CurrentBusinessOpeningHourPeriod
  products_and_services: ProductsAndService[]
  marketing_events: any[]
  mean_of_payments_or_loyalty_programs: MeanOfPaymentsOrLoyaltyProgram[]
  pictures: Picture[]
  exceptional_closure_starts_at: any
}

interface CurrentBusinessOpeningHourPeriod {
  name: string
  from: string
  to: string
  contractual: boolean
  full_automate: boolean
  opening_hours: OpeningHour[]
}

interface OpeningHour {
  closed: boolean
  day_of_week: string
  slots: Slot[]
}

interface Slot {
  number: string
  opens_at: string
  closes_at: string
}

interface ProductsAndService {
  product_code: string
  product_name: string
  start_date: string
  end_date?: string
  category_code: string
  sub_category_code: string
  availability_status?: string
  price_update_date_time?: string
  price?: number
  unit_of_measure_code?: string
  currency_code?: string
  pictogram_url: string
  pictogram_alt_text: string
  offer_description: any
}

interface MeanOfPaymentsOrLoyaltyProgram {
  mean_of_payment_or_loyalty_program_code: string
  mean_of_payment_or_loyalty_program_name: string
  type_code: string
  type_label: string
  start_date: string
  end_date: string
  pictogram_url: string
  pictogram_alt_text: string
}

interface Picture {
  url: string
  is_main: boolean
  alt_text: string
}
