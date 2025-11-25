import React, { useState, useEffect } from "react";
import Offcanvas from "react-bootstrap/Offcanvas";
import { useRouter } from "next/router";
import Link from "next/link";
import Image from "next/image";
import { menus } from "./Menus";
import { useReactiveVar } from "@apollo/client";
import { userVar } from "@/apollo/store";
// Menus data

function Navbar() {
  const router = useRouter();
  const pathname = router.pathname;
  const user = useReactiveVar(userVar);

  // Sticky navbar effect
  useEffect(() => {
    const element = document.getElementById("navbar");

    const onScroll = () => {
      if (!element) return;
      if (window.scrollY > 170) {
        element.classList.add("sticky");
      } else {
        element.classList.remove("sticky");
      }
    };

    // Run once to set initial state
    onScroll();

    // Add listener (passive for performance)
    window.addEventListener("scroll", onScroll, { passive: true });

    // Cleanup to prevent memory leaks
    return () => {
      window.removeEventListener("scroll", onScroll);
      element?.classList.remove("sticky");
    };
  }, []);

  // Offcanvas state
  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  // Dropdown states
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const toggleDropdown = (dropdownName: string) => {
    setOpenDropdown(openDropdown === dropdownName ? null : dropdownName);
  };

  // Check if a link is active
  const isActive = (href: string) => pathname === href;

  return (
    <>
      <nav className="navbar navbar-expand-xl" id="navbar">
        <div className="container-fluid">
          <Link href="/" className="navbar-brand">
            <Image
              src="/images/mdbrdg_large.png"
              alt="MediBridge"
              width={134}
              height={80}
            />
          </Link>
          <button className="navbar-toggler" onClick={handleShow}>
            <span className="burger-menu">
              <span className="icon-bar top-bar"></span>
              <span className="icon-bar middle-bar"></span>
              <span className="icon-bar bottom-bar"></span>
            </span>
          </button>

          {/* For Desktop Menu */}
          <div className="collapse navbar-collapse">
            <ul className="navbar-nav">
              {menus.map((item) => (
                <li key={item.id} className="nav-item">
                  {item.isDropdown ? (
                    <>
                      <Link
                        href="#"
                        onClick={(e) => e.preventDefault()}
                        className="dropdown-toggle nav-link"
                      >
                        {item.title}{" "}
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="14"
                          height="8"
                          viewBox="0 0 14 8"
                          fill="none"
                        >
                          <path
                            d="M13 1.5L7 6.5L1 1.5"
                            stroke="#5A6A85"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </Link>
                      <ul className="dropdown-menu">
                        {item.dropdownItems?.map((dropdownItem, index) => (
                          <li key={index} className="nav-item">
                            <Link
                              href={dropdownItem.href}
                              className={`nav-link ${
                                isActive(dropdownItem.href) ? "active" : ""
                              }`}
                            >
                              {dropdownItem.title}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </>
                  ) : (
                    <Link
                      href={item.href || "#"}
                      className={`nav-link ${
                        isActive(item.href || "") ? "active" : ""
                      }`}
                    >
                      {item.title}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* others-options */}
          <div className="others-option align-items-center overflow-hidden d-none d-sm-flex">
            <div className="option-item">
              <Link href="/login" className="login-btn">
                <Image
                  src="/images/icons/user.svg"
                  alt="user"
                  width={20}
                  height={20}
                />
                <span>Login</span>
              </Link>
            </div>
            <div className="option-item">
              <Link href="/signup" className="default-btn">
                <span className="left">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="12"
                    height="12"
                    viewBox="0 0 12 12"
                    fill="none"
                  >
                    <path
                      d="M11.5385 0H0.461538C0.206769 0 0 0.206769 0 0.461538C0 0.716308 0.206769 0.923077 0.461538 0.923077H10.4241L0.135231 11.2122C-0.045 11.3924 -0.045 11.6845 0.135231 11.8648C0.225462 11.955 0.343385 12 0.461538 12C0.579692 12 0.697846 11.955 0.787846 11.8648L11.0769 1.57569V11.5385C11.0769 11.7932 11.2837 12 11.5385 12C11.7932 12 12 11.7932 12 11.5385V0.461538C12 0.206769 11.7932 0 11.5385 0Z"
                      fill="white"
                    />
                  </svg>
                </span>
                <strong>Register Now</strong>{" "}
                <span className="d-none d-xxl-inline">- It&apos;s Free</span>
                <span className="right">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="12"
                    height="12"
                    viewBox="0 0 12 12"
                    fill="none"
                  >
                    <path
                      d="M11.5385 0H0.461538C0.206769 0 0 0.206769 0 0.461538C0 0.716308 0.206769 0.923077 0.461538 0.923077H10.4241L0.135231 11.2122C-0.045 11.3924 -0.045 11.6845 0.135231 11.8648C0.225462 11.955 0.343385 12 0.461538 12C0.579692 12 0.697846 11.955 0.787846 11.8648L11.0769 1.57569V11.5385C11.0769 11.7932 11.2837 12 11.5385 12C11.7932 12 12 11.7932 12 11.5385V0.461538C12 0.206769 11.7932 0 11.5385 0Z"
                      fill="white"
                    />
                  </svg>
                </span>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* For Mobile Menu */}
      <Offcanvas
        show={show}
        onHide={handleClose}
        placement="end"
        style={{ width: "300px" }}
      >
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>
            <Image
              src="/images/mdbrdg_large.png"
              alt="MediBridge"
              width={134}
              height={35}
            />
          </Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <div className="mobile-menu">
            {/* others-options */}
            <div className="others-option d-flex align-items-center gap-3 mb-3">
              <div className="option-item">
                <Link
                  href="/login"
                  className="login-btn d-flex align-items-center gap-2"
                >
                  <Image
                    src="/images/icons/user.svg"
                    alt="user"
                    width={20}
                    height={20}
                  />
                  <span>Login</span>
                </Link>
              </div>
              <div className="option-item">
                <Link href="/register" className="default-btn">
                  <span className="left">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="12"
                      height="12"
                      viewBox="0 0 12 12"
                      fill="none"
                    >
                      <path
                        d="M11.5385 0H0.461538C0.206769 0 0 0.206769 0 0.461538C0 0.716308 0.206769 0.923077 0.461538 0.923077H10.4241L0.135231 11.2122C-0.045 11.3924 -0.045 11.6845 0.135231 11.8648C0.225462 11.955 0.343385 12 0.461538 12C0.579692 12 0.697846 11.955 0.787846 11.8648L11.0769 1.57569V11.5385C11.0769 11.7932 11.2837 12 11.5385 12C11.7932 12 12 11.7932 12 11.5385V0.461538C12 0.206769 11.7932 0 11.5385 0Z"
                        fill="white"
                      />
                    </svg>
                  </span>
                  <strong>Register Now</strong>
                  <span className="right">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="12"
                      height="12"
                      viewBox="0 0 12 12"
                      fill="none"
                    >
                      <path
                        d="M11.5385 0H0.461538C0.206769 0 0 0.206769 0 0.461538C0 0.716308 0.206769 0.923077 0.461538 0.923077H10.4241L0.135231 11.2122C-0.045 11.3924 -0.045 11.6845 0.135231 11.8648C0.225462 11.955 0.343385 12 0.461538 12C0.579692 12 0.697846 11.955 0.787846 11.8648L11.0769 1.57569V11.5385C11.0769 11.7932 11.2837 12 11.5385 12C11.7932 12 12 11.7932 12 11.5385V0.461538C12 0.206769 11.7932 0 11.5385 0Z"
                        fill="white"
                      />
                    </svg>
                  </span>
                </Link>
              </div>
            </div>
            {/* mobile-menu-list */}
            <ul className="mobile-menu-list">
              {menus.map((item) => (
                <li key={item.id} className="nav-item">
                  {item.isDropdown ? (
                    <>
                      <div
                        className="dropdown-toggle nav-link"
                        onClick={() => toggleDropdown(item.id)}
                      >
                        <span>{item.title}</span>{" "}
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="14"
                          height="8"
                          viewBox="0 0 14 8"
                          fill="none"
                          className={`transition-transform duration-300 ${
                            openDropdown === item.id ? "rotate-180" : ""
                          }`}
                        >
                          <path
                            d="M13 1.5L7 6.5L1 1.5"
                            stroke="#5A6A85"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>
                      <ul
                        className={`dropdown-menu ${
                          openDropdown === item.id ? "show" : ""
                        }`}
                      >
                        {item.dropdownItems?.map((dropdownItem, index) => (
                          <li key={index} className="nav-item">
                            <Link
                              href={dropdownItem.href}
                              className={`nav-link ${
                                isActive(dropdownItem.href) ? "active" : ""
                              }`}
                              onClick={handleClose}
                            >
                              {dropdownItem.title}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </>
                  ) : (
                    <Link
                      href={item.href || "#"}
                      className={`nav-link ${
                        isActive(item.href || "") ? "active" : ""
                      }`}
                      onClick={handleClose}
                    >
                      {item.title}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </Offcanvas.Body>
      </Offcanvas>
    </>
  );
}

export default Navbar;
