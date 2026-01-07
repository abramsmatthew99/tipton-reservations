import React, { useState } from "react";
type BookingSearchProps = {
  onSearch: (checkIn: string, checkOut: string, guests: number) => void;
  checkInDate: string;
  checkOutDate: string;
  guests: number;
};

function CustomerDateFilter({
  onSearch,
  checkInDate,
  checkOutDate,
  guests,
}: BookingSearchProps) {
  const [localCheckIn, setLocalCheckIn] = useState(checkInDate || "");
  const [localCheckOut, setLocalCheckOut] = useState(checkOutDate || "");
  const [localGuests, setLocalGuests] = useState(guests || 2);
  const [error, setError] = useState("");

  const handleSearchClick = () => {
    if (!localCheckIn || !localCheckOut || !localGuests) {
      setError("Please select check-in, check-out, and guests.");
      return;
    }

    setError("");
    onSearch(localCheckIn, localCheckOut, localGuests);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Check-in */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 mb-2">
            Check-in
          </label>
          <input
            type="date"
            value={localCheckIn}
            onChange={(e) => setLocalCheckIn(e.target.value)}
            className="px-4 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            placeholder="mm/dd/yyyy"
          />
        </div>

        {/* Check-out */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 mb-2">
            Check-out
          </label>
          <input
            type="date"
            value={localCheckOut}
            onChange={(e) => setLocalCheckOut(e.target.value)}
            className="px-4 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            placeholder="mm/dd/yyyy"
          />
        </div>

        {/* Guests */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 mb-2">
            Guests
          </label>
          <select
            value={localGuests}
            onChange={(e) => setLocalGuests(Number(e.target.value))}
            className="px-4 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
          >
            <option value={1}>1 Guest</option>
            <option value={2}>2 Guests</option>
            <option value={3}>3 Guests</option>
            <option value={4}>4 Guests</option>
            <option value={5}>5 Guests</option>
            <option value={6}>6 Guests</option>
            <option value={7}>7 Guests</option>
            <option value={8}>8 Guests</option>
            <option value={9}>9 Guests</option>
            <option value={10}>10 Guests</option>
            <option value={11}>11 Guests</option>
            <option value={12}>12 Guests</option>
          </select>
        </div>

        {/* Search Button */}
        <div className="flex flex-col justify-end">
          <button
            onClick={handleSearchClick}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-2.5 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Search
          </button>
          {error ? (
            <p className="mt-2 text-sm text-red-600">{error}</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default CustomerDateFilter;
