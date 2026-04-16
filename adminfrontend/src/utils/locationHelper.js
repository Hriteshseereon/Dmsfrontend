/**
 * locationHelper.js
 *
 * Packages used:
 *   npm install country-state-city ind-state-district
 *
 * country-state-city  → Countries, States (isoCode), Cities
 * ind-state-district  → Districts (flat array keyed by their own stateCode)
 *
 * The two packages use DIFFERENT state codes for 2 states:
 *   "Chhattisgarh"  → csc: "CT"  | isd: "CG"
 *   "Dadra and Nagar Haveli and Daman and Diu" → csc: "DH" | isd: "DN"
 * The NAME_BRIDGE below handles these mismatches transparently.
 */

import { Country, State, City } from "country-state-city";
// import districtJson from "ind-state-district/assets/district.json";
// import statesJson   from "ind-state-district/assets/states.json";
import { indiaLocations } from "./indialocation";
// ─── raw data from ind-state-district ────────────────────────────────────────


/**
 * Bridge for the 2 states whose names differ between packages.
 * Key   = name used by country-state-city
 * Value = stateCode used by ind-state-district
 */

// ─── internal: resolve isdCode from a state name (csc naming) ────────────────

// ─────────────────────────────────────────────────────────────────────────────
// PUBLIC API
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Returns all countries as { value, label } options.
 * value = isoCode (e.g. "IN")   ← used internally to fetch states
 * label = name   (e.g. "India") ← displayed in dropdown + sent in payload
 */
export function getCountryOptions() {
  return Country.getAllCountries().map((c) => ({
    value: c.isoCode,
    label: c.name,
  }));
}

/**
 * Returns states for a given countryIsoCode as { value, label } options.
 * value = isoCode (e.g. "OR")      ← used internally to fetch cities
 * label = name   (e.g. "Odisha")   ← displayed + sent in payload
 *
 * @param {string} countryIsoCode  e.g. "IN"
 */
export function getStateOptions(countryIsoCode) {
  if (!countryIsoCode) return [];
  return State.getStatesOfCountry(countryIsoCode).map((s) => ({
    value: s.isoCode,
    label: s.name,
  }));
}

/**
 * Returns districts for a given stateName (plain name, NOT isoCode) as
 * { value, label } options.
 *
 * We pass stateName (not isoCode) because ind-state-district is resolved by
 * name → isdCode, keeping the bridge logic here and out of the component.
 *
 * @param {string} stateName  e.g. "Odisha"
 */
export function getDistrictOptions(stateName) {
  if (!stateName) return [];

  const stateData = indiaLocations.find(
    (item) => item.state === stateName
  );

  if (!stateData) return [];

  return stateData.districts.map((district) => ({
    value: district,
    label: district,
  }));
}

/**
 * Returns cities for a given country+state combination as { value, label }.
 * Cities come from country-state-city and are linked to the STATE, not the
 * district (that is a limitation of all available free packages).
 *
 * @param {string} countryIsoCode  e.g. "IN"
 * @param {string} stateIsoCode    e.g. "OR"  (csc isoCode, NOT ind stateCode)
 */
export function getCityOptions(countryIsoCode, stateIsoCode) {
  if (!countryIsoCode || !stateIsoCode) return [];
  return City.getCitiesOfState(countryIsoCode, stateIsoCode).map((c) => ({
    value: c.name,
    label: c.name,
  }));
}

// ─────────────────────────────────────────────────────────────────────────────
// EDIT / VIEW helpers
// Used in openCustomer() to restore isoCode state variables from plain names
// stored in the API response.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Given a plain country name (e.g. "India") returns its isoCode ("IN").
 * Returns null if not found.
 */
export function getCountryIsoByName(countryName) {
  if (!countryName) return null;
  const found = Country.getAllCountries().find((c) => c.name === countryName);
  return found?.isoCode ?? null;
}

/**
 * Given a plain state name (e.g. "Odisha") and its countryIsoCode returns
 * the state's isoCode ("OR"). Returns null if not found.
 */
export function getStateIsoByName(countryIsoCode, stateName) {
  if (!countryIsoCode || !stateName) return null;
  const found = State.getStatesOfCountry(countryIsoCode).find(
    (s) => s.name === stateName
  );
  return found?.isoCode ?? null;
}