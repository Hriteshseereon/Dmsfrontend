/**
 * locationHelper.js
 *
 * Packages used:
 *   country-state-city  → Countries, States (isoCode), Cities
 *   indiaLocation.js    → Districts for India states
 *   cityData.js         → Deep district and city mappings for Odisha & West Bengal
 */

import { Country, State, City } from "country-state-city";
import { cityData } from "../modules/DMS/pages/module/Master/Business/tabs/cityData";
import { indiaLocations } from "./indiaLocation";

// ─────────────────────────────────────────────────────────────────────────────
// PUBLIC API
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Returns all countries as { value, label } options.
 * value = isoCode (e.g. "IN")
 * label = name   (e.g. "India")
 */
export function getCountryOptions() {
  return Country.getAllCountries().map((c) => ({
    value: c.isoCode,
    label: c.name,
  }));
}

/**
 * Returns states for a given countryIsoCode as { value, label } options with ISO code as value.
 * value = isoCode (e.g. "OR")
 * label = name   (e.g. "Odisha")
 *
 * @param {string} countryIsoCode  e.g. "IN"
 */
export function getStateOptions(countryIsoCode) {
  if (!countryIsoCode) return [];
  const iso =
    countryIsoCode.length === 2
      ? countryIsoCode
      : getCountryIsoByName(countryIsoCode) || "IN";
  return State.getStatesOfCountry(iso).map((s) => ({
    value: s.isoCode,
    label: s.name,
  }));
}

/**
 * Returns states for a given countryIsoCode as { value, label } options with State Name as value.
 * value = name (e.g. "Odisha")
 * label = name (e.g. "Odisha")
 *
 * @param {string} countryIsoCode  e.g. "IN"
 */
export function getStateNameOptions(countryIsoCode = "IN") {
  if (!countryIsoCode) return [];
  const iso =
    countryIsoCode.length === 2
      ? countryIsoCode
      : getCountryIsoByName(countryIsoCode) || "IN";
  return State.getStatesOfCountry(iso).map((s) => ({
    value: s.name,
    label: s.name,
  }));
}

/**
 * Returns districts for a given stateName (plain name, NOT isoCode) as
 * { value, label } options.
 *
 * @param {string} stateName  e.g. "Odisha"
 */
export function getDistrictOptions(stateName) {
  if (!stateName) return [];

  const stateData = indiaLocations.find(
    (item) => item.state.toLowerCase() === stateName.toLowerCase()
  );

  if (!stateData) return [];

  return stateData.districts.map((district) => ({
    value: district,
    label: district,
  }));
}

/**
 * Returns all cities for a given state (by stateName or stateIsoCode) as { value, label } options.
 * Pulls from cityData (Odisha, West Bengal / Kolkata), country-state-city, and indiaLocations.
 *
 * @param {string} stateNameOrCode  e.g. "Odisha", "West Bengal", "OR", "WB"
 * @param {string} countryIsoCode   e.g. "IN"
 */
export function getCitiesForState(stateNameOrCode, countryIsoCode = "IN") {
  if (!stateNameOrCode) return [];

  const countryIso =
    countryIsoCode?.length === 2
      ? countryIsoCode
      : getCountryIsoByName(countryIsoCode) || "IN";

  let stateName = null;
  let stateIso = null;

  if (
    stateNameOrCode.length <= 3 &&
    stateNameOrCode === stateNameOrCode.toUpperCase()
  ) {
    stateIso = stateNameOrCode;
    const foundState = State.getStateByCodeAndCountry(stateIso, countryIso);
    stateName = foundState?.name || null;
  } else {
    stateName = stateNameOrCode;
    stateIso = getStateIsoByName(countryIso, stateName);
  }

  const citiesSet = new Set();

  // 1. Try matching cityData (for Odisha, West Bengal, etc. - flattening all district cities)
  if (stateName) {
    const cityDataKey = Object.keys(cityData || {}).find(
      (k) => k.toLowerCase() === stateName.toLowerCase()
    );
    if (cityDataKey && cityData[cityDataKey]) {
      const stateDistricts = cityData[cityDataKey];
      Object.values(stateDistricts).forEach((distCities) => {
        if (Array.isArray(distCities)) {
          distCities.forEach((city) => {
            if (city && typeof city === "string") {
              citiesSet.add(city.trim());
            }
          });
        }
      });
    }
  }

  // 2. Also check country-state-city
  if (countryIso && stateIso) {
    try {
      const cscCities = City.getCitiesOfState(countryIso, stateIso);
      if (Array.isArray(cscCities) && cscCities.length > 0) {
        cscCities.forEach((c) => {
          if (c?.name) {
            citiesSet.add(c.name.trim());
          }
        });
      }
    } catch (e) {
      console.warn("Error fetching csc cities:", e);
    }
  }

  // 3. Fallback to indiaLocations (districts as cities) if citiesSet is empty for India
  if (
    citiesSet.size === 0 &&
    (countryIso === "IN" || countryIsoCode === "India") &&
    stateName
  ) {
    const stateItem = indiaLocations.find(
      (item) => item.state.toLowerCase() === stateName.toLowerCase()
    );
    if (stateItem?.districts) {
      stateItem.districts.forEach((d) => citiesSet.add(d.trim()));
    }
  }

  const sortedCities = Array.from(citiesSet).sort((a, b) =>
    a.localeCompare(b)
  );

  return sortedCities.map((city) => ({
    value: city,
    label: city,
  }));
}

/**
 * Returns cities options. Supports multiple calling signatures:
 * 1. getCityOptions(stateName, district) -> cities in district (e.g. "Odisha", "Khordha")
 * 2. getCityOptions(countryIso, stateIso) -> all cities in state (e.g. "IN", "OR")
 * 3. getCityOptions(stateName)           -> all cities in state (e.g. "Odisha", "West Bengal")
 */
export function getCityOptions(arg1, arg2, arg3) {
  if (!arg1) return [];

  // If district is provided (e.g. getCityOptions("Odisha", "Khordha"))
  if (arg1 && arg2) {
    // Check if arg1 is in cityData and arg2 is a district
    const stateKey = Object.keys(cityData || {}).find(
      (k) => k.toLowerCase() === String(arg1).toLowerCase()
    );
    if (stateKey && cityData[stateKey]) {
      const districtKey = Object.keys(cityData[stateKey]).find(
        (d) => d.toLowerCase() === String(arg2).toLowerCase()
      );
      if (districtKey && Array.isArray(cityData[stateKey][districtKey])) {
        return cityData[stateKey][districtKey].map((city) => ({
          value: city,
          label: city,
        }));
      }
    }

    // Check if arg1 is countryIso (2 chars) and arg2 is stateIso or stateName
    if (
      String(arg1).length === 2 &&
      String(arg1) === String(arg1).toUpperCase()
    ) {
      return getCitiesForState(arg2, arg1);
    }

    // Otherwise treat arg1 as state and fallback to all cities for that state
    const stateCities = getCitiesForState(arg1, arg3 || "IN");
    if (stateCities.length > 0) return stateCities;
  }

  // If only one arg (e.g. getCityOptions("Odisha") or getCityOptions("OR"))
  return getCitiesForState(arg1, arg2 || "IN");
}

// ─────────────────────────────────────────────────────────────────────────────
// EDIT / VIEW helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Given a plain country name (e.g. "India") returns its isoCode ("IN").
 * Returns null if not found.
 */
export function getCountryIsoByName(countryName) {
  if (!countryName) return null;
  const found = Country.getAllCountries().find(
    (c) =>
      c.name.toLowerCase() === countryName.toLowerCase() ||
      c.isoCode.toLowerCase() === countryName.toLowerCase()
  );
  return found?.isoCode ?? null;
}

/**
 * Given a plain state name (e.g. "Odisha") and its countryIsoCode returns
 * the state's isoCode ("OR"). Returns null if not found.
 */
export function getStateIsoByName(countryIsoCode, stateName) {
  if (!countryIsoCode || !stateName) return null;
  const iso =
    countryIsoCode.length === 2
      ? countryIsoCode
      : getCountryIsoByName(countryIsoCode) || "IN";
  const found = State.getStatesOfCountry(iso).find(
    (s) =>
      s.name.toLowerCase() === stateName.toLowerCase() ||
      s.isoCode.toLowerCase() === stateName.toLowerCase()
  );
  return found?.isoCode ?? null;
}