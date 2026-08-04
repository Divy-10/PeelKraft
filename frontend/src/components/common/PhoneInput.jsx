import { useState, useEffect, useRef } from 'react';
import { countries } from '../../utils/countries';
import { FiSearch, FiChevronDown } from 'react-icons/fi';
import { parsePhoneNumberFromString } from 'libphonenumber-js';

const PhoneInput = ({ value, country, onChange, error }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);

  const selectedCountry = countries.find(c => c.code === country.toUpperCase()) || countries[0];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  const handleSelectCountry = (c) => {
    setIsOpen(false);
    setSearch('');
    onChange({ country: c.code, value });
  };

  const filteredCountries = countries.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.code.toLowerCase().includes(search.toLowerCase()) ||
    c.dialCode.includes(search)
  );

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="flex items-stretch rounded-xl overflow-hidden">
        {/* Dropdown Selector Button */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center gap-1.5 px-3 py-2.5 bg-gray-50/80 hover:bg-gray-100 border border-gray-200 border-r-0 outline-none transition select-none cursor-pointer text-sm font-inter text-gray-700 min-w-[90px] justify-between ${
            error ? 'border-red-500' : 'focus:border-primary-500 focus:ring-2 focus:ring-primary-100'
          }`}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
        >
          <span className="flex items-center gap-1">
            <span className="text-base">{selectedCountry.flag}</span>
            <span className="font-semibold text-xs text-gray-400">{selectedCountry.dialCode}</span>
          </span>
          <FiChevronDown className="w-3.5 h-3.5 text-gray-400 shrink-0" />
        </button>

        {/* Local Number Input */}
        <input
          type="tel"
          value={value}
          onChange={(e) => {
            const cleanVal = e.target.value.replace(/\D/g, '');
            onChange({ country, value: cleanVal });
          }}
          required
          className={`w-full px-4 py-2.5 border border-gray-200 outline-none transition font-inter text-sm rounded-r-xl ${
            error
              ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-100'
              : 'border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100'
          }`}
          placeholder="Enter local number"
        />
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute left-0 top-[105%] mt-1 w-64 bg-white border border-gray-100 rounded-2xl shadow-xl z-50 py-2 flex flex-col max-h-72">
          {/* Search bar inside Dropdown */}
          <div className="px-3 pb-2 pt-1 border-b border-gray-50 flex items-center relative">
            <FiSearch className="absolute left-6 text-gray-400 w-3.5 h-3.5" />
            <input
              ref={searchInputRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search country name or code..."
              className="w-full pl-8 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs outline-none focus:border-primary-500 transition font-inter"
            />
          </div>

          {/* List of Countries */}
          <ul role="listbox" className="overflow-y-auto flex-1 py-1">
            {filteredCountries.length === 0 ? (
              <li className="px-4 py-2.5 text-xs text-gray-400 text-center font-inter">No countries found.</li>
            ) : (
              filteredCountries.map((c) => (
                <li
                  key={c.code}
                  role="option"
                  aria-selected={c.code === country}
                  onClick={() => handleSelectCountry(c)}
                  className={`flex items-center justify-between px-4 py-2 hover:bg-gray-50 cursor-pointer text-xs font-inter transition-colors ${
                    c.code === country ? 'bg-primary-50/50 text-primary-600 font-semibold' : 'text-gray-700'
                  }`}
                >
                  <span className="flex items-center gap-2 truncate">
                    <span className="text-sm shrink-0">{c.flag}</span>
                    <span className="truncate">{c.name}</span>
                  </span>
                  <span className="text-gray-400 shrink-0 ml-2">{c.dialCode}</span>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default PhoneInput;
