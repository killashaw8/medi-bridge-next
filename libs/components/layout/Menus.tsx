export const menus = [
  {
    id: "home",
    title: "Home",
    isDropdown: true,
    dropdownItems: [
      { title: "Home", href: "/" },
      { title: "About Us", href: "/about-us" },
    ],
  },
  {
    id: "services",
    title: "Services",
    isDropdown: true,
    dropdownItems: [
      { title: "Book Appointment", href: "/bookAppointment" },
      { title: "My Appointments", href: "/myAppointments" },
    ],
  },
  {
    id: "doctors",
    title: "Clinics",
    isDropdown: true,
    dropdownItems: [
      { title: "Clinics", href: "/clinics/" },
      { title: "Doctors", href: "/doctors/" },
    ],
  },
  {
    id: "pricing",
    title: "Shopping",
    isDropdown: true,
    dropdownItems: [
      { title: "Products", href: "/products/" },
      { title: "My Orders", href: "/myOrders/" },
    ],
  },
  {
    id: "articles",
    title: "Articles",
    href: "/article"
  },
  {
    id: "pages",
    title: "FAQ & Contact",
    isDropdown: true,
    dropdownItems: [
      { title: "Feedbacks", href: "/feedbacks/" },
      { title: "FAQ's", href: "/faq/" },
      { title: "Privacy Policy", href: "/privacy-policy/" },
      { title: "Terms & Conditions", href: "/terms/" },
      { title: "Contact Us", href: "/contact-us/" },
    ],
  },
];
