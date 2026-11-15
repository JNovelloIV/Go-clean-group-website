// Online booking address (no trailing slash), e.g. "https://book.gocleangroup.com".
// The live booking site today is https://go-clean-booking.pages.dev (customers land on /book).
// To switch online booking on, set this ONE line to "https://go-clean-booking.pages.dev"
// (or the custom address once SETUP-STEPS 10 picks one, e.g. "https://book.gocleangroup.com").
// While null, the "Book online" section and every booking link render nothing.
export const BOOKING_URL: string | null = "https://go-clean-booking.pages.dev";

// Does the booking site show live free slots? false = request-a-time mode: the customer
// names a preferred time and a founder confirms it on WhatsApp. That is what it does today,
// because the calendar connection is not switched on yet. When it is, set this to true and
// the "Book online" copy goes back to "pick a free slot".
export const BOOKING_SHOWS_FREE_SLOTS = false;
