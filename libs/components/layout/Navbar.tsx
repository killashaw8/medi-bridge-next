import React, { useState, useEffect } from "react";
import Offcanvas from "react-bootstrap/Offcanvas";
import { useRouter, withRouter } from "next/router";
import Link from "next/link";
import Image from "next/image";
import { menus } from "./Menus";
import { useReactiveVar } from "@apollo/client";
import { userVar } from "@/apollo/store";
import { logOut, getJwtToken, updateUserInfo } from "@/libs/auth";
import { Menu, MenuItem } from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import { getImageUrl } from "@/libs/imageHelper";
import { useMemo } from 'react';

const Navbar = () => {
  const router = useRouter();
  const pathname = router.pathname;
  const user = useReactiveVar(userVar);
  const [logoutAnchor, setLogoutAnchor] = useState<null | HTMLElement>(null);
  const logoutOpen = Boolean(logoutAnchor);
  const [isSticky, setIsSticky] = useState(false);
  const [colorChange, setColorChange] = useState(false);

  const DEFAULT_USER_IMAGE = '/images/users/defaultUser.svg'

  /** LIFECYCLES **/
  useEffect(() => {
    const jwt = getJwtToken();
    const currentUser = userVar();
    if (jwt) {
      if (!currentUser?._id || !currentUser?.memberImage || currentUser.memberImage === DEFAULT_USER_IMAGE) {
        updateUserInfo(jwt);
      }
    }
  }, []);

  useEffect(() => {
    console.log('=== NAVBAR USER DEBUG ===');
    console.log('User object:', user);
    console.log('memberImage value:', user?.memberImage);
    console.log('memberImage type:', typeof user?.memberImage);
    console.log('memberImage length:', user?.memberImage?.length);
    console.log('getImageUrl result:', getImageUrl(user?.memberImage));
    console.log('========================');
  }, [user]);

  // Debug logging (remove in production)
  useEffect(() => {
    console.log('Navbar - User state:', {
      hasId: !!user?._id,
      id: user?._id,
      nick: user?.memberNick,
      image: user?.memberImage,
    });
  }, [user]);

  // Sticky navbar effect
  useEffect(() => {
    const onScroll = () => {
      const scrolled = window.scrollY >= 50;
      setIsSticky(scrolled);
      setColorChange(scrolled);
    };
 
    onScroll(); // initialize
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
 
  const navClasses = [
    "navbar",
    "navbar-expand-xl",
    isSticky ? "sticky" : "",
    colorChange ? "navbar-colored" : "",
  ].join(" ");  

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

  // Handler for logout
  const handleLogout = () => {
    setLogoutAnchor(null);
    logOut();
  };

  // Get user image URL
const userImageUrl = useMemo(() => {
  if (!user?.memberImage || user.memberImage === '') {
    return '/images/users/defaultUser.svg';
  }
  
  const imageUrl = getImageUrl(user.memberImage);
  
  // Debug logging (remove in production)
  if (process.env.NODE_ENV === 'development') {
    console.log('Navbar - User image path:', user.memberImage);
    console.log('Navbar - Generated image URL:', imageUrl);
  }
  
  return imageUrl;
}, [user?.memberImage]);

  // Check if user is logged in
  const isLoggedIn = user?._id && user._id !== '';

  return (
    <>
      <nav className={navClasses} id="navbar">
        <div className={`container-fluid ${colorChange ? 'transparent' : ''}`}>
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
              
              {/* ✅ ADD: My Page link when logged in */}
              {isLoggedIn && (
                <li className="nav-item">
                  <Link
                    href="/mypage"
                    className={`nav-link ${isActive("/mypage") ? "active" : ""}`}
                  >
                    My Page
                  </Link>
                </li>
              )}
            </ul>
          </div>

          {/* Conditional rendering based on login status */}
          <div className="others-option align-items-center overflow-hidden d-none d-sm-flex">
            {isLoggedIn ? (
              // ✅ User is logged in - show profile image with menu
              <div className="option-item">
                <div
                  className="user-profile-box"
                  onClick={(event: React.MouseEvent<HTMLElement>) => 
                    setLogoutAnchor(event.currentTarget)
                  }
                  style={{
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '4px 8px',
                    borderRadius: '8px',
                    transition: 'background-color 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <Image
                    src={userImageUrl}
                    alt={user?.memberNick || 'User'}
                    width={32}
                    height={32}
                    unoptimized={true}
                    onError={(e) => {
                      console.error('Navbar - Image failed to load:', userImageUrl);
                      // Fallback to default on error
                      const target = e.target as HTMLImageElement;
                      if (target.src !== '/images/users/defaultUser.svg') {
                        target.src = '/images/users/defaultUser.svg';
                      }
                    }}
                    style={{
                      borderRadius: '50%',
                      objectFit: 'cover',
                    }}
                  />
                  <span>
                    {user?.memberNick}
                  </span>
                </div>
                
                {/* ✅ Logout Menu */}
                <Menu
                  id="logout-menu"
                  anchorEl={logoutAnchor}
                  open={logoutOpen}
                  onClose={() => setLogoutAnchor(null)}
                  sx={{ mt: '5px' }}
                  anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                  }}
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                >
                  <MenuItem onClick={handleLogout}>
                    <LogoutIcon fontSize="small" style={{ color: '#616161', marginRight: '10px' }} />
                    Logout
                  </MenuItem>
                </Menu>
              </div>
            ) : (
              // ✅ User is not logged in - show login/register buttons
              <>
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
              </>
            )}
          </div>
        </div>
      </nav>

      {/* ✅ MODIFIED: For Mobile Menu */}
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
            {/* ✅ MODIFIED: others-options for mobile */}
            <div className="others-option d-flex align-items-center gap-3 mb-3">
              {isLoggedIn ? (
                // ✅ User is logged in - show profile
                <div className="option-item w-100">
                  <div
                    className="user-profile-box d-flex align-items-center gap-2 p-2"
                    onClick={(event: React.MouseEvent<HTMLElement>) => 
                      setLogoutAnchor(event.currentTarget)
                    }
                    style={{
                      cursor: 'pointer',
                      borderRadius: '8px',
                      transition: 'background-color 0.2s',
                    }}
                  >
                    <Image
                      src={userImageUrl}
                      alt={user?.memberNick || 'User'}
                      width={40}
                      height={40}
                      unoptimized={userImageUrl.startsWith('http')}
                      onError={(e) => {
                        console.error('Navbar Mobile - Image failed to load:', userImageUrl);
                        // Fallback to default on error
                        const target = e.target as HTMLImageElement;
                        if (target.src !== '/images/users/defaultUser.svg') {
                          target.src = '/images/users/defaultUser.svg';
                        }
                      }}
                      style={{
                        borderRadius: '50%',
                        objectFit: 'cover',
                      }}
                    />
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: '500' }}>
                        {user?.memberFullName || user?.memberNick || "User"}
                      </div>
                      <div style={{ fontSize: '12px', color: '#888' }}>
                        {user?.memberPhone || ""}
                      </div>
                    </div>
                  </div>
                  
                  {/* ✅ Logout Menu for mobile */}
                  <Menu
                    id="logout-menu-mobile"
                    anchorEl={logoutAnchor}
                    open={logoutOpen}
                    onClose={() => setLogoutAnchor(null)}
                    sx={{ mt: '5px' }}
                  >
                    <MenuItem onClick={handleLogout}>
                      <LogoutIcon fontSize="small" style={{ color: '#616161', marginRight: '10px' }} />
                      Logout
                    </MenuItem>
                  </Menu>
                </div>
              ) : (
                // ✅ User is not logged in
                <>
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
                </>
              )}
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
              
              {/* ✅ ADD: My Page link in mobile menu when logged in */}
              {isLoggedIn && (
                <li className="nav-item">
                  <Link
                    href="/mypage"
                    className={`nav-link ${isActive("/mypage") ? "active" : ""}`}
                    onClick={handleClose}
                  >
                    My Page
                  </Link>
                </li>
              )}
            </ul>
          </div>
        </Offcanvas.Body>
      </Offcanvas>
    </>
  );
}

export default withRouter(Navbar);

