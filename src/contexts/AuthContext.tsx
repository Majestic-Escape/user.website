"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useCheckToken } from "@/services/useCheckToken";
import { usePathname } from "next/navigation";
type User = {
  email: string;
  // Add other user properties as needed
};

// Add types for filter states
type FilterRooms = {
  bedrooms: number;
  beds: number;
  bathrooms: number;
};
type BookingQuery = {
  propertyId?: string;
  checkin?: string;
  checkout?: string;
  guests?: number;
  nights?: number;
  adults?: number;
  children?: number;
  infants?: number;
  checkinTime?: string;
  checkoutTime?: string;
  propertyImage?: string;
};
type AuthContextType = {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
  modalFilter: boolean;
  setModalFilter: React.Dispatch<React.SetStateAction<boolean>>;
  openModal: () => void;
  closeModal: () => void;
  toggleModal: () => void;
  modalCheckDate: {
    from: Date | undefined;
    to: Date | undefined;
  };
  setModalCheckDate: React.Dispatch<
    React.SetStateAction<{
      from: Date | undefined;
      to: Date | undefined;
    }>
  >;
  modalMobilePrice: number;
  setModalMobilePrice: React.Dispatch<React.SetStateAction<number>>;
  perNightPrice: string;
  setPerNightPrice: React.Dispatch<React.SetStateAction<string>>;
  bookingQuery: BookingQuery | null;
  setBookingQuery: React.Dispatch<React.SetStateAction<BookingQuery | null>>;

  // Filter states
  priceRange: number[];
  setPriceRange: React.Dispatch<React.SetStateAction<number[]>>;
  rooms: FilterRooms;
  setRooms: React.Dispatch<React.SetStateAction<FilterRooms>>;
  showAllAmenities: boolean;
  setShowAllAmenities: React.Dispatch<React.SetStateAction<boolean>>;
  openPriceModal: boolean;
  setOpenPriceModal: React.Dispatch<React.SetStateAction<boolean>>;
  resetClicked: boolean;
  setResetClicked: React.Dispatch<React.SetStateAction<boolean>>;
  showAllProperties: boolean;
  setShowAllProperties: React.Dispatch<React.SetStateAction<boolean>>;
  addAmenities: string[];
  setAddAmenities: React.Dispatch<React.SetStateAction<string[]>>;
  addPlaceType: string;
  setAddPlaceType: React.Dispatch<React.SetStateAction<string>>;
  addPropertyType: string;
  setAddPropertyType: React.Dispatch<React.SetStateAction<string>>;
  bookingType: string;
  setBookingType: React.Dispatch<React.SetStateAction<string>>;
  petAllowed: string;
  setPetAllowed: React.Dispatch<React.SetStateAction<string>>;
  checkinType: string;
  setCheckinType: React.Dispatch<React.SetStateAction<string>>;
  activeTab: string;
  setActiveTab: React.Dispatch<React.SetStateAction<string>>;
  // Filter functions
  clearAllFilters: () => void;
  addAmenitiesList: (value: string) => void;
  addPropertiesList: (value: string) => void;
  handleRoomChange: (field: keyof FilterRooms, delta: number) => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [bookingQuery, setBookingQuery] = useState<BookingQuery | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [modalFilter, setModalFilter] = useState<boolean>(false);
  const [resetClicked, setResetClicked] = useState<boolean>(false);
  // Add all filter states from modal
  const [priceRange, setPriceRange] = useState([501, 83000]);
  const [rooms, setRooms] = useState({ bedrooms: 0, beds: 0, bathrooms: 0 });
  const [showAllAmenities, setShowAllAmenities] = useState(false);
  const [showAllProperties, setShowAllProperties] = useState(false);
  const [addAmenities, setAddAmenities] = useState<string[]>([]);
  const [addPlaceType, setAddPlaceType] = useState("");
  const [addPropertyType, setAddPropertyType] = useState("");
  const [bookingType, setBookingType] = useState("");
  const [petAllowed, setPetAllowed] = useState("");
  const [checkinType, setCheckinType] = useState("");
  const [openPriceModal, setOpenPriceModal] = useState(false);
  const [activeTab, setActiveTab] = useState("filters");
  const { checkToken } = useCheckToken();
  const [modalCheckDate, setModalCheckDate] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: undefined,
    to: undefined,
  });
  const [perNightPrice, setPerNightPrice] = useState<string>("");
  const [modalMobilePrice, setModalMobilePrice] = useState<number>(
    Number(perNightPrice)
  );
  const pathname = usePathname();

  useEffect(() => {
    const verify = async () => {
      await checkToken();
      if (pathname == "/") {
        clearAllFilters();
      }
    };
    verify();
  }, [pathname]);
  useEffect(() => {
    // Check for existing user in localStorage on initial load
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    // Load saved filters from localStorage if needed
    const savedFilters = sessionStorage.getItem("filterState");
    if (savedFilters) {
      const filters = JSON.parse(savedFilters);
      // Set all filter states from saved data
      setPriceRange(filters.priceRange || [501, 83000]);
      setRooms(filters.rooms || { bedrooms: 0, beds: 0, bathrooms: 0 });
      setAddAmenities(filters.addAmenities || []);
      setAddPropertyType(filters.addPropertyType || "");
      setAddPlaceType(filters.addPlaceType || "");
      setBookingType(filters.bookingType || "");
      setPetAllowed(filters.petAllowed || "");
      setCheckinType(filters.checkinType || "");
    }
  }, []);

  const login = (userData: User) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.clear();
    sessionStorage.clear();
    // localStorage.removeItem("user");
    // localStorage.removeItem("filterState"); // Clear filters on logout
  };

  // Convenience functions for modal
  const openModal = () => setModalFilter(true);
  const closeModal = () => setModalFilter(false);
  const toggleModal = () => setModalFilter((prev) => !prev);

  // Filter functions
  const clearAllFilters = () => {
    setPriceRange([501, 83000]);
    setRooms({ bedrooms: 0, beds: 0, bathrooms: 0 });
    setShowAllAmenities(false);
    setShowAllProperties(false);
    setAddAmenities([]);
    setBookingType("");
    setPetAllowed("");
    setCheckinType("");
    setAddPropertyType("");
    setAddPlaceType("");
    sessionStorage.removeItem("filterState");
  };

  const addAmenitiesList = (value: string) => {
    if (!addAmenities.includes(value)) {
      setAddAmenities([...addAmenities, value]);
    } else {
      const data = addAmenities.filter((item) => item !== value);
      setAddAmenities(data);
    }
  };

  const addPropertiesList = (value: string) => {
    if (addPropertyType == "") {
      setAddPropertyType(value);
    } else {
      // const data = addPropertyType.filter((item) => item !== value);
      // setAddPropertyType(data);
    }

    // if (!addPropertyType.includes(value)) {
    //   setAddPropertyType([...addPropertyType, value]);
    // } else {
    //   const data = addPropertyType.filter((item) => item !== value);
    //   setAddPropertyType(data);
    // }
  };

  const handleRoomChange = (field: keyof FilterRooms, delta: number) => {
    setRooms((prev) => ({
      ...prev,
      [field]: Math.max(0, prev[field] + delta),
    }));
  };

  // Save filters to localStorage when they change
  useEffect(() => {
    const filterState = {
      priceRange,
      rooms,
      addAmenities,
      addPropertyType,
      addPlaceType,
      bookingType,
      petAllowed,
      checkinType,
    };
    sessionStorage.setItem("filterState", JSON.stringify(filterState));
  }, [
    priceRange,
    rooms,
    addAmenities,
    addPropertyType,
    addPlaceType,
    bookingType,
    petAllowed,
    checkinType,
  ]);

  useEffect(() => {
    checkToken();
  }, []);
  const value: AuthContextType = {
    user,
    login,
    logout,
    modalFilter,
    setModalFilter,
    openModal,
    closeModal,
    toggleModal,
    priceRange,
    setPriceRange,
    rooms,
    setRooms,
    showAllAmenities,
    setShowAllAmenities,
    showAllProperties,
    setShowAllProperties,
    addAmenities,
    setAddAmenities,
    addPlaceType,
    setAddPlaceType,
    addPropertyType,
    setAddPropertyType,
    bookingType,
    setBookingType,
    petAllowed,
    setPetAllowed,
    checkinType,
    setCheckinType,
    clearAllFilters,
    addAmenitiesList,
    addPropertiesList,
    handleRoomChange,
    activeTab,
    setActiveTab,
    openPriceModal,
    setOpenPriceModal,
    resetClicked,
    setResetClicked,

    modalCheckDate,
    setModalCheckDate,
    modalMobilePrice,
    setModalMobilePrice,

    perNightPrice,
    setPerNightPrice,

    bookingQuery,
    setBookingQuery,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
// return (
//   <AuthContext.Provider
//     value={{
//       user,
//       login,
//       logout,
//       modalFilter,
//       setModalFilter,
//       openModal,
//       closeModal,
//       toggleModal,
//       // Filter states
//       priceRange,
//       setPriceRange,
//       rooms,
//       setRooms,
//       showAllAmenities,
//       setShowAllAmenities,
//       showAllProperties,
//       setShowAllProperties,
//       addAmenities,
//       setAddAmenities,
//       addPlaceType,
//       setAddPlaceType,
//       addPropertyType,
//       setAddPropertyType,
//       bookingType,
//       setBookingType,
//       petAllowed,
//       setPetAllowed,
//       checkinType,
//       setCheckinType,
//       // Filter functions
//       clearAllFilters,
//       addAmenitiesList,
//       addPropertiesList,
//       handleRoomChange,
//     }}
//   >
//     {children}
//   </AuthContext.Provider>
// );

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
