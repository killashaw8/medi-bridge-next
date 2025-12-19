export const menus = [
  {
    id: "home",
    title: "Home",
    href: "/",
    isDropdown: true,
    dropdownItems: [
      { title: "About Us", href: "/about-us" },
    ],
  },
  {
    id: "services",
    title: "Services",
    href: "/bookAppointment"
  },
  {
    id: "doctors",
    title: "Clinics",
    isDropdown: true,
    dropdownItems: [
      { title: "Clinics", href: "/getClinics/" },
      { title: "Doctors", href: "/getDoctors/" },
    ],
  },
  {
    id: "pricing",
    title: "Shopping",
    isDropdown: true,
    dropdownItems: [
      { title: "Products", href: "/getProducts/" },
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
