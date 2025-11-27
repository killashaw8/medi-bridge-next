import React, { useState, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { signUp } from "@/libs/auth";
import { sweetMixinErrorAlert } from "@/libs/sweetAlert";
import { DoctorSpecialization, MemberType } from "@/libs/enums/member.enum";
import { ClinicsInquiry } from "@/libs/types/member/member.input";
import { useQuery } from "@apollo/client";
import { GET_CLINICS } from "@/apollo/user/query";
import { Member } from "@/libs/types/member/member";
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { IconButton } from "@mui/material";

const RegisterForm = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
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

  const clinicsInput: ClinicsInquiry = {
    page: 1,
    limit: 100, // Get all clinics
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

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name.trim()) {
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
      const nick = formData.name.trim(); 
      const memberType = formData.userType as string;
      
      const signUpParams: {
        nick: string;
        password: string;
        phone: string;
        type: string;
        specialization?: DoctorSpecialization;
        clinicId?: string;
      } = {
        nick,
        password: formData.password.trim(),
        phone: formData.phone.trim(),
        type: memberType,
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
        signUpParams.specialization,
        signUpParams.clinicId
      );
      
      router.push("/");
    } catch (error) {
      console.error("Registration error:", error);
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
                  name="name"
                  value={formData.name}
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
                <button
                  type="submit"
                  className="default-btn"
                  disabled={loading}
                >
                  <span className="left">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="19"
                      height="19"
                      viewBox="0 0 19 19"
                      fill="none"
                    >
                      <path
                        d="M17.8077 0.98584H1.19231C0.810154 0.98584 0.5 1.29599 0.5 1.67815C0.5 2.0603 0.810154 2.37046 1.19231 2.37046H16.1361L0.702846 17.8041C0.4325 18.0744 0.4325 18.5126 0.702846 18.783C0.838192 18.9183 1.01508 18.9858 1.19231 18.9858C1.36954 18.9858 1.54677 18.9183 1.68177 18.783L17.1154 3.34938V18.2935C17.1154 18.6757 17.4255 18.9858 17.8077 18.9858C18.1898 18.9858 18.5 18.6757 18.5 18.2935V1.67815C18.5 1.29599 18.1898 0.98584 17.8077 0.98584Z"
                        fill="white"
                      />
                    </svg>
                  </span>
                  {loading ? "Registering..." : "Register Now"}
                  <span className="right">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="19"
                      height="19"
                      viewBox="0 0 19 19"
                      fill="none"
                    >
                      <path
                        d="M17.8077 0.98584H1.19231C0.810154 0.98584 0.5 1.29599 0.5 1.67815C0.5 2.0603 0.810154 2.37046 1.19231 2.37046H16.1361L0.702846 17.8041C0.4325 18.0744 0.4325 18.5126 0.702846 18.783C0.838192 18.9183 1.01508 18.9858 1.19231 18.9858C1.36954 18.9858 1.54677 18.9183 1.68177 18.783L17.1154 3.34938V18.2935C17.1154 18.6757 17.4255 18.9858 17.8077 18.9858C18.1898 18.9858 18.5 18.6757 18.5 18.2935V1.67815C18.5 1.29599 18.1898 0.98584 17.8077 0.98584Z"
                        fill="white"
                      />
                    </svg>
                  </span>
                </button>
              </div>
            </form>
            
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
