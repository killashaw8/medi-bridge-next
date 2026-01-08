import React, { useEffect, useState, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { logInWithGoogle, logInWithTelegram, signUp, updateUserInfoFromResponse } from "@/libs/auth";
import { sweetMixinErrorAlert } from "@/libs/sweetAlert";
import { DoctorSpecialization, MemberType } from "@/libs/enums/member.enum";
import { ClinicsInquiry } from "@/libs/types/member/member.input";
import { useQuery } from "@apollo/client";
import { GET_CLINICS } from "@/apollo/user/query";
import { Member } from "@/libs/types/member/member";
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { IconButton, Button } from "@mui/material";
import { useMutation } from "@apollo/client";
import Image from "next/image";
import { IMAGE_UPLOADER } from "@/apollo/user/mutation";
import { UPDATE_MEMBER } from "@/apollo/user/mutation";
import { GET_MEMBER } from "@/apollo/user/query";
import { initializeApollo } from "@/apollo/client";
import ImageCropper from "@/libs/components/common/ImageCropper";
import { FaGoogle, FaTelegramPlane } from "react-icons/fa";
import TelegramLoginButton, { TelegramUser } from "@/libs/components/common/TelegramLoginButton";

declare global {
  interface Window {
    google?: any;
  }
}

const RegisterForm = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: "",
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    userType: MemberType.USER,
    specialization: "" as DoctorSpecialization | "",
    clinicId: "",
  });
  const [loading, setLoading] = useState(false);
  const [agree, setAgree] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [cropperOpen, setCropperOpen] = useState(false);
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [googleReady, setGoogleReady] = useState(false);
  const telegramBotName = process.env.NEXT_PUBLIC_TELEGRAM_BOT_NAME;

  const [uploadImage] = useMutation(IMAGE_UPLOADER);
  const [updateMember] = useMutation(UPDATE_MEMBER);

  const clinicsInput: ClinicsInquiry = {
    page: 1,
    limit: 100,
    sort: 'createdAt',
    direction: 'ASC',
    search: {},
  };

  const { data: clinicsData, loading: clinicsLoading } = useQuery(GET_CLINICS, {
    variables: { input: clinicsInput },
    skip: formData.userType !== MemberType.DOCTOR,
    fetchPolicy: "cache-and-network",
  });

  const clinics: Member[] = clinicsData?.getClinics?.list || [];

  useEffect(() => {
    if (typeof window === "undefined") return;
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId) {
      console.warn("Missing NEXT_PUBLIC_GOOGLE_CLIENT_ID");
      return;
    }

    const initializeGoogle = () => {
      if (!window.google?.accounts?.id) return;

      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: async (response: { credential?: string }) => {
          if (!response?.credential) {
            await sweetMixinErrorAlert("Google login failed. Please try again.");
            return;
          }

          setLoading(true);
          try {
            await logInWithGoogle(response.credential);
            router.push("/");
          } catch (error) {
            console.error("Google login error:", error);
          } finally {
            setLoading(false);
          }
        },
      });

      setGoogleReady(true);
    };

    if (window.google?.accounts?.id) {
      initializeGoogle();
      return;
    }

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = initializeGoogle;
    document.body.appendChild(script);

    return () => {
      script.onload = null;
    };
  }, [router]);

  const handleGoogleLogin = async () => {
    if (!window.google?.accounts?.id) {
      await sweetMixinErrorAlert("Google login is not ready. Please try again.");
      return;
    }
    window.google.accounts.id.prompt();
  };

  const handleTelegramAuth = async (user: TelegramUser) => {
    setLoading(true);
    try {
      await logInWithTelegram({
        id: user.id,
        hash: user.hash,
        auth_date: user.auth_date,
        first_name: user.first_name,
        last_name: user.last_name,
        username: user.username,
        photo_url: user.photo_url,
      });
      router.push("/");
    } catch (error) {
      console.error("Telegram login error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "userType" && value !== MemberType.DOCTOR && {
        specialization: "",
        clinicId: "",
      }),
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        sweetMixinErrorAlert('Please select a valid image file');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        sweetMixinErrorAlert('Image size must be less than 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const imageUrl = reader.result as string;
        setImageToCrop(imageUrl);  
        setCropperOpen(true); 
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCropComplete = (croppedFile: File) => {
    // Set the cropped file as selected image
    setSelectedImage(croppedFile);

    // Create preview from cropped file
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(croppedFile);

    // Reset cropper state
    setImageToCrop(null);
  };

  const uploadMemberImage = async (file: File): Promise<string | null> => {
    try {
      setUploadingImage(true);
      
      const result = await uploadImage({
        variables: {
          file: file,
          target: 'member',
        },
      });

      if (result?.data?.imageUploader) {
        return result.data.imageUploader;
      }
      return null;
    } catch (error: any) {
      console.error('Image upload error:', error);
      await sweetMixinErrorAlert('Failed to upload image. Please try again.');
      return null;
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Validation
    if (!formData.username.trim()) {
      await sweetMixinErrorAlert("Please enter your username");
      return;
    }

    if (!formData.fullName.trim()) {
      await sweetMixinErrorAlert("Please enter your full name");
      return;
    }

    if (!formData.email.trim()) {
      await sweetMixinErrorAlert("Please enter your email address");
      return;
    }

    if (!formData.phone.trim()) {
      await sweetMixinErrorAlert("Please enter your phone number");
      return;
    }

    if (!formData.password.trim()) {
      await sweetMixinErrorAlert("Please enter your password");
      return;
    }

    if (formData.password.length < 6) {
      await sweetMixinErrorAlert("Password must be at least 6 characters long");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      await sweetMixinErrorAlert("Passwords do not match. Please try again");
      return;
    }

    if (formData.userType === MemberType.DOCTOR) {
      if (!formData.specialization) {
        await sweetMixinErrorAlert("Please select your specialization");
        return;
      }
      if (!formData.clinicId) {
        await sweetMixinErrorAlert("Please select a clinic");
        return;
      }
    }

    if (!agree) {
      await sweetMixinErrorAlert("Please agree to the Privacy Policy to continue");
      return;
    }

    setLoading(true);

    try {
      const memberType = formData.userType as string;
      
      const signUpParams: {
        nick: string;
        password: string;
        phone: string;
        type: string;
        fullName: string;
        email: string;
        specialization?: DoctorSpecialization;
        clinicId?: string;
      } = {
        nick: formData.username.trim(),
        password: formData.password.trim(),
        phone: formData.phone.trim(),
        type: memberType,
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
      };

      if (formData.userType === MemberType.DOCTOR) {
        signUpParams.specialization = formData.specialization as DoctorSpecialization;
        signUpParams.clinicId = formData.clinicId;
      }

      await signUp(
        signUpParams.nick,
        signUpParams.password,
        signUpParams.phone,
        signUpParams.type,
        signUpParams.fullName,
        signUpParams.email,
        signUpParams.specialization,
        signUpParams.clinicId
      );

      if (selectedImage) {
        const imageUrl = await uploadMemberImage(selectedImage);
        if (imageUrl) {
          try {
            const updateResult = await updateMember({
              variables: {
                input: {
                  memberImage: imageUrl,
                },
              },
            });
            
            if (updateResult?.data?.updateMember) {
              const updatedMember = updateResult.data.updateMember;
              updateUserInfoFromResponse(updatedMember);
              
              const apolloClient = initializeApollo();
              const { data } = await apolloClient.query({
                query: GET_MEMBER,
                variables: { 
                  targetId: updatedMember._id,
                  includeLocation: updatedMember.memberType === MemberType.CLINIC,
                },
                fetchPolicy: 'network-only',
              });
              if (data?.getMember) {
                updateUserInfoFromResponse(data.getMember);
              }
              console.log('Member image updated successfully:', imageUrl);
            }
          } catch (error: any) {
            console.error('Failed to update member image:', error);
          }
        }
      }      
      
      router.push("/");
    } catch (error: any) {
      console.error("signup error:", error);
      await sweetMixinErrorAlert(error?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const isDoctor = formData.userType === MemberType.DOCTOR;

  return (
    <>
      <div className="profile-authentication-area pt-140">
        <div className="container">
          <div className="profile-authentication-inner">
            <div className="content">
              <h3>Create Your MediBridge Account</h3>
              <p>
                Access your dashboard, manage appointments, and connect with
                licensed doctors—securely and conveniently.
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>
                  Username <span>(required)</span>
                </label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="e.g. Lara7"
                  disabled={loading}
                  required
                />
              </div>

              <div className="form-group">
                <label>
                  Full Name <span>(required)</span>
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="e.g. Lara Croft"
                  disabled={loading}
                  required
                />
              </div>

              <div className="form-group">
                <label>
                  Email Address <span>(required)</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="e.g. lara@support.com"
                  disabled={loading}
                  required
                />
              </div>

              <div className="form-group">
                <label>
                  Phone Number <span>(required)</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="e.g. 010-1234-5678"
                  disabled={loading}
                  required
                />
              </div>

              <div className="form-group">
                <label>
                  Password <span>(required)</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="form-control"
                    placeholder="Enter your password (min. 6 characters)"
                    disabled={loading}
                    required
                    minLength={6}
                    style={{ paddingRight: '45px' }}
                  />
                  {/* ✅ ADD: Material-UI IconButton */}
                  <IconButton
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={loading}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    sx={{
                      position: 'absolute',
                      right: '5px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      padding: '4px',
                      color: '#666',
                      '&:hover': {
                        backgroundColor: 'rgba(0, 0, 0, 0.04)',
                      },
                    }}
                  >
                    {showPassword ? (
                      <VisibilityOffIcon fontSize="small" />
                    ) : (
                      <VisibilityIcon fontSize="small" />
                    )}
                  </IconButton>
                </div>
              </div>

              <div className="form-group">
                <label>
                  Confirm Password <span>(required)</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="form-control"
                    placeholder="Confirm your password"
                    disabled={loading}
                    required
                    style={{ paddingRight: '45px' }}
                  />
                  {/* ✅ ADD: Material-UI IconButton */}
                  <IconButton
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    disabled={loading}
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                    sx={{
                      position: 'absolute',
                      right: '5px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      padding: '4px',
                      color: '#666',
                      '&:hover': {
                        backgroundColor: 'rgba(0, 0, 0, 0.04)',
                      },
                    }}
                  >
                    {showConfirmPassword ? (
                      <VisibilityOffIcon fontSize="small" />
                    ) : (
                      <VisibilityIcon fontSize="small" />
                    )}
                  </IconButton>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="memberImage">Profile Image (Optional)</label>
                <div className="image-upload-container">
                  {imagePreview && (
                    <div className="image-preview">
                      <Image
                        src={imagePreview}
                        alt="Profile preview"
                        width={100}
                        height={100}
                        style={{
                          borderRadius: '50%',
                          objectFit: 'cover',
                          marginBottom: '10px',
                        }}
                      />
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <Button
                          type="button"
                          variant="contained"
                          onClick={() => {
                            if (selectedImage) {
                              // Reopen cropper with current image
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                setImageToCrop(reader.result as string);
                                setCropperOpen(true);
                              };
                              reader.readAsDataURL(selectedImage);
                            } else if (imagePreview) {
                              // Reopen cropper with preview
                              setImageToCrop(imagePreview);
                              setCropperOpen(true);
                            }
                          }}
                          className="crop-image-btn"
                          disabled={loading || uploadingImage}
                        >
                          Edit/Crop Image
                        </Button>
                        <Button
                          type="button"
                          variant="contained"
                          color="error"
                          onClick={() => {
                            setSelectedImage(null);
                            setImagePreview(null);
                          }}
                          className="remove-image-btn"
                          disabled={loading || uploadingImage}
                        >
                          Remove Image
                        </Button>
                      </div>
                    </div>
                  )}
                  <input
                    type="file"
                    id="memberImage"
                    name="memberImage"
                    accept="image/*"
                    onChange={handleImageChange}
                    disabled={loading || uploadingImage}
                    style={{ display: 'none' }}
                  />
                  {!imagePreview && (
                    <label
                      htmlFor="memberImage"
                      className={`file-upload-label ${loading || uploadingImage ? 'disabled' : ''}`}
                    >
                      Select Profile Image
                    </label>
                  )}
                  {uploadingImage && <p>Uploading image...</p>}
                </div>

                {/* Image Cropper Modal */}
                {imageToCrop && (
                  <ImageCropper
                    image={imageToCrop}
                    open={cropperOpen}
                    onClose={() => {
                      setCropperOpen(false);
                      setImageToCrop(null);
                    }}
                    onCropComplete={handleCropComplete}
                    aspectRatio={1} // Square crop (1:1) - change to 4/3 for 4:3, etc.
                  />
                )}
              </div>             

              <div className="form-group">
                <label>User Type</label>
                <select
                  className="form-control form-select"
                  name="userType"
                  value={formData.userType}
                  onChange={handleChange}
                  disabled={loading}
                  required
                >
                  <option value={MemberType.USER}>User</option>
                  <option value={MemberType.CLINIC}>Clinic</option>
                  <option value={MemberType.DOCTOR}>Doctor</option>
                </select>
              </div>

              {isDoctor && (
                <div className="form-group">
                  <label>
                    Specialization <span>(required)</span>
                  </label>
                  <select
                    className="form-control form-select"
                    name="specialization"
                    value={formData.specialization}
                    onChange={handleChange}
                    disabled={loading || clinicsLoading}
                    required
                  >
                    <option value="">Select Specialization</option>
                    <option value={DoctorSpecialization.CARDIOLOGIST}>Cardiologist</option>
                    <option value={DoctorSpecialization.DENTIST}>Dentist</option>
                    <option value={DoctorSpecialization.PEDIATRICIAN}>Pediatrician</option>
                    <option value={DoctorSpecialization.DERMATOLOGIST}>Dermatologist</option>
                    <option value={DoctorSpecialization.PSYCHIATRIST}>Psychiatrist</option>
                    <option value={DoctorSpecialization.NEUROLOGIST}>Neurologist</option>
                    <option value={DoctorSpecialization.OPHTHALMOLOGIST}>Ophthalmologist</option>
                    <option value={DoctorSpecialization.ORTHOPEDIC}>Orthopedic</option>
                    <option value={DoctorSpecialization.ONCOLOGIST}>Oncologist</option>
                    <option value={DoctorSpecialization.GYNAECOLOGIST}>Gynaecologist</option>
                    <option value={DoctorSpecialization.GASTROENTEROLOGIST}>Gastroenterologist</option>
                    <option value={DoctorSpecialization.OTOLARYNGOLOGIST}>Otolaryngologist</option>
                    <option value={DoctorSpecialization.SURGEON}>Surgeon</option>
                  </select>
                </div>
              )}

              {isDoctor && (
                <div className="form-group">
                  <label>
                    Clinic <span>(required)</span>
                  </label>
                  <select
                    className="form-control form-select"
                    name="clinicId"
                    value={formData.clinicId}
                    onChange={handleChange}
                    disabled={loading || clinicsLoading}
                    required
                  >
                    <option value="">Select Clinic</option>
                    {clinics.map((clinic) => (
                      <option key={clinic._id} value={clinic._id}>
                        {clinic.memberFullName || clinic.memberNick}
                      </option>
                    ))}
                  </select>
                  {clinicsLoading && (
                    <small className="text-muted">Loading clinics...</small>
                  )}
                  {!clinicsLoading && clinics.length === 0 && (
                    <small className="text-muted">No clinics available</small>
                  )}
                </div>
              )}

              <div className="options">
                <label>
                  <input
                    type="checkbox"
                    name="agree"
                    checked={agree}
                    onChange={(e) => setAgree(e.target.checked)}
                    disabled={loading}
                    required
                  />
                  I confirm that I have read and agree to the Privacy Policy.
                </label>
              </div>

              <div className="authentication-btn">
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={loading}
                >
                  Register
                </Button>
              </div>
            </form>

            <div className="auth-divider">
              <span>OR</span>
            </div>

            <div className="social-auth">
              <p>Sign in with:</p>
              <div className="social-auth-icons">
                <div className="social-auth-icon">
                  <button
                    type="button"
                    className="social-auth-btn"
                    onClick={handleGoogleLogin}
                    disabled={!googleReady || loading}
                    aria-label="Sign in with Google"
                  >
                    <FaGoogle />
                  </button>
                </div>
                {telegramBotName ? (
                  <div className="telegram-auth social-auth-icon">
                    <button
                      type="button"
                      className="social-auth-btn"
                      aria-label="Sign in with Telegram"
                      disabled={loading}
                    >
                      <FaTelegramPlane />
                    </button>
                    <TelegramLoginButton
                      botName={telegramBotName}
                      onAuth={handleTelegramAuth}
                      size="large"
                      cornerRadius={12}
                      usePic={false}
                      className="telegram-login-overlay"
                    />
                  </div>
                ) : null}
              </div>
            </div>
            
            <div className="bottom-text">
              <span>
                Already have an account? <Link href="/account/login">Login</Link>
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default RegisterForm;
