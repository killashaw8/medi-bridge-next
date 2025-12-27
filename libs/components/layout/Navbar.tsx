import React, { useState, useEffect, useRef } from "react";
import Offcanvas from "react-bootstrap/Offcanvas";
import { useRouter, withRouter } from "next/router";
import Link from "next/link";
import Image from "next/image";
import { menus } from "./Menus";
import { useQuery, useReactiveVar } from "@apollo/client";
import { cartVar, userVar } from "@/apollo/store";
import { logOut, getJwtToken, refreshTokens, updateUserInfo } from "@/libs/auth";
import { Badge, Box, Button, IconButton, Menu, MenuItem, Typography } from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import EmailIcon from '@mui/icons-material/Email';
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import { getImageUrl } from "@/libs/imageHelper";
import { useMemo } from 'react';
import CheckoutPopover from "@/libs/components/order/CheckoutPopover";
import { GET_CONVERSATIONS } from "@/apollo/user/query";
import { ChatConversation } from "@/libs/types/chat/chat";
import { io, Socket } from "socket.io-client";
import jwtDecode from "jwt-decode";

const Navbar = () => {
  const router = useRouter();
  const pathname = router.pathname;
  const user = useReactiveVar(userVar);
  const cartItems = useReactiveVar(cartVar);
  const { data: conversationsData, refetch: refetchConversations } = useQuery(GET_CONVERSATIONS, {
    skip: !user?._id,
    fetchPolicy: "cache-and-network",
  });
  const socketRef = useRef<Socket | null>(null);
  const [logoutAnchor, setLogoutAnchor] = useState<null | HTMLElement>(null);
  const logoutOpen = Boolean(logoutAnchor);
  const [cartAnchor, setCartAnchor] = useState<null | HTMLElement>(null);
  const cartOpen = Boolean(cartAnchor);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [isSticky, setIsSticky] = useState(false);
  const [colorChange, setColorChange] = useState(false);
  const [imageRefreshKey, setImageRefreshKey] = useState(0);
  const [nickRefreshKey, setNickRefreshKey] = useState(0);

  const DEFAULT_USER_IMAGE = '/images/users/defaultUser.svg'

  const getStoredImageVersion = (userId?: string) => {
    if (typeof window === 'undefined') return 0;
    if (!userId) return 0;
    const storageKey = `memberImageVersion:${userId}`;
    const rawValue = localStorage.getItem(storageKey);
    const parsed = rawValue ? Number(rawValue) : 0;
    return Number.isFinite(parsed) ? parsed : 0;
  };

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

  useEffect(() => {
    if (!user?._id) return;
    const storedVersion = getStoredImageVersion(user._id);
    setImageRefreshKey(storedVersion || Date.now());
    setNickRefreshKey(Date.now());
  }, [user?._id, user?.memberImage]);

  useEffect(() => {
    if (!user?._id) return;
    let cancelled = false;

    const connect = async () => {
      let token = getJwtToken();
      if (token === "undefined" || token === "null") token = "";
      if (!token) return;
      token = token.replace(/^Bearer\s+/i, "");
      if (token.split(".").length !== 3) return;
      try {
        const { exp } = jwtDecode<{ exp?: number }>(token);
        if (exp && Date.now() >= exp * 1000) {
          token = await refreshTokens();
        }
      } catch {
        try {
          token = await refreshTokens();
        } catch {
          return;
        }
      }
      if (!token) return;
      token = token.replace(/^Bearer\s+/i, "");
      if (token.split(".").length !== 3) return;
      if (cancelled) return;

      const socketUrl =
        process.env.NEXT_PUBLIC_API_SOCKET ??
        process.env.NEXT_PUBLIC_API_URL ??
        process.env.REACT_APP_API_URL ??
        "http://localhost:5885";
      const socket = io(socketUrl, {
        auth: { token },
        query: { token },
        transports: ["websocket"],
      });
      socketRef.current = socket;

      const handleMessage = (payload: { message?: { conversationId?: string } }) => {
        if (!payload?.message?.conversationId) return;
        void refetchConversations();
      };
      const handleRead = () => {
        void refetchConversations();
      };

      socket.on("chat:message", handleMessage);
      socket.on("chat:read", handleRead);

      (socketRef.current as any).__cleanup = () => {
        socket.off("chat:message", handleMessage);
        socket.off("chat:read", handleRead);
        socket.disconnect();
      };
    };

    void connect();

    return () => {
      cancelled = true;
      const cleanup = (socketRef.current as any)?.__cleanup;
      if (cleanup) cleanup();
      socketRef.current = null;
    };
  }, [user?._id, refetchConversations]);

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
    logOut({ reload: false });
    router.push("/");
  };

  // Get user image URL
const userImageUrl = useMemo(() => {
  if (!user?.memberImage || user.memberImage === '') {
    return '/images/users/defaultUser.svg';
  }

  const imageUrl = getImageUrl(user.memberImage);
  const cacheBust = imageRefreshKey ? `v=${imageRefreshKey}` : '';
  const separator = imageUrl.includes('?') ? '&' : '?';

  // Debug logging (remove in production)
  if (process.env.NODE_ENV === 'development') {
    console.log('Navbar - User image path:', user.memberImage);
    console.log('Navbar - Generated image URL:', imageUrl);
  }

  return cacheBust ? `${imageUrl}${separator}${cacheBust}` : imageUrl;
}, [user?.memberImage, imageRefreshKey]);

  const displayNick = useMemo(() => {
    return user?.memberNick || user?.memberFullName || 'User';
  }, [user?.memberNick, user?.memberFullName, nickRefreshKey]);

  // Check if user is logged in
  const isLoggedIn = user?._id && user._id !== '';
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cartItems.reduce(
    (sum, item) => sum + item.product.productPrice * item.quantity,
    0
  );
  const chatUnreadCount = (conversationsData?.getConversations ?? []).reduce(
    (sum: number, convo: ChatConversation) => sum + (convo.unreadCount ?? 0),
    0
  );

  const handleCartQuantityChange = (productId: string, delta: number) => {
    const currentCart = cartVar();
    const nextCart = currentCart
      .map((item) => {
        if (item.product._id !== productId) return item;
        const nextQuantity = item.quantity + delta;
        return { ...item, quantity: nextQuantity };
      })
      .filter((item) => item.quantity > 0);
    cartVar(nextCart);
  };

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
                      <a
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
                      </a>
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
            <div className="option-item">
              <IconButton
                size="small"
                onClick={(event) => setCartAnchor(event.currentTarget)}
                aria-label="Cart"
              >
                <Badge badgeContent={cartCount} color="error">
                  <ShoppingCartIcon />
                </Badge>
              </IconButton>
              <Menu
                id="cart-menu"
                anchorEl={cartAnchor}
                open={cartOpen}
                onClose={() => setCartAnchor(null)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                sx={{ mt: '5px' }}
              >
                <Box sx={{ p: 2, width: 320 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                    Cart
                  </Typography>
                  {cartItems.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">
                      Your cart is empty.
                    </Typography>
                  ) : (
                    <>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                        {cartItems.map((item) => {
                          const isMaxed = item.product.productCount <= item.quantity;
                          return (
                          <Box
                            key={item.product._id}
                            sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}
                          >
                            <img
                              src={
                                item.product.productImages?.[0]
                                  ? getImageUrl(item.product.productImages[0])
                                  : "/images/thumbnail.png"
                              }
                              alt={item.product.productTitle}
                              width={44}
                              height={44}
                              style={{ borderRadius: 6, objectFit: "cover" }}
                            />
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                              <Typography variant="body2" noWrap>
                                {item.product.productTitle}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                Qty {item.quantity} · ${item.product.productPrice.toFixed(2)}
                              </Typography>
                              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 0.5 }}>
                                <IconButton
                                  size="small"
                                  onClick={() => handleCartQuantityChange(item.product._id, -1)}
                                  aria-label="Decrease quantity"
                                >
                                  <RemoveIcon fontSize="small" />
                                </IconButton>
                                <Typography
                                  variant="caption"
                                  sx={{ minWidth: 18, textAlign: "center" }}
                                >
                                  {item.quantity}
                                </Typography>
                                <IconButton
                                  size="small"
                                  onClick={() => handleCartQuantityChange(item.product._id, 1)}
                                  disabled={isMaxed}
                                  aria-label="Increase quantity"
                                >
                                  <AddIcon fontSize="small" />
                                </IconButton>
                              </Box>
                            </Box>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              ${(item.product.productPrice * item.quantity).toFixed(2)}
                            </Typography>
                          </Box>
                        );
                        })}
                      </Box>
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          mt: 2,
                          pt: 1,
                          borderTop: '1px solid #eee',
                        }}
                      >
                        <Typography variant="body2" color="text.secondary">
                          Total
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>
                          ${cartTotal.toFixed(2)}
                        </Typography>
                      </Box>
                      <Button
                        variant="contained"
                        fullWidth
                        sx={{ mt: 2 }}
                        onClick={() => {
                          setCartAnchor(null);
                          setCheckoutOpen(true);
                        }}
                      >
                        Proceed to checkout
                      </Button>
                    </>
                  )}
                </Box>
              </Menu>
            </div>
            {isLoggedIn && (
              <div className="option-item">
                <Link href="/chat">
                  <IconButton size="small" aria-label="Chat">
                    <Badge color="error" badgeContent={chatUnreadCount}>
                      <EmailIcon />
                    </Badge>
                  </IconButton>
                </Link>
              </div>
            )}
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
                  <span key={nickRefreshKey}>
                    @{displayNick}
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

      <CheckoutPopover
        open={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        cartItems={cartItems}
      />

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
                        {displayNick}
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
              {isLoggedIn && (
                <div className="option-item w-100">
                  <Link
                    href="/chat"
                    className="login-btn d-flex align-items-center gap-2"
                  >
                    <Badge color="error" badgeContent={chatUnreadCount}>
                      <EmailIcon />
                    </Badge>
                    <span>Chat</span>
                  </Link>
                </div>
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
