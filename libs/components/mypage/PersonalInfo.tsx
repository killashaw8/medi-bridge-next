import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useReactiveVar } from "@apollo/client";
import { userVar } from "@/apollo/store";
import { useMutation, useQuery } from "@apollo/client";
import { UPDATE_MEMBER } from "@/apollo/user/mutation";
import { GET_MEMBER } from "@/apollo/user/query";
import { sweetMixinErrorAlert, sweetMixinSuccessAlert } from "@/libs/sweetAlert";
import { getImageUrl } from "@/libs/imageHelper";
import { MemberUpdate } from "@/libs/types/member/member.update";
import ImageCropper from "@/libs/components/common/ImageCropper";
import { DoctorSpecialization } from "@/libs/enums/member.enum";

const PersonalInfo: React.FC = () => {
  const user = useReactiveVar(userVar);
  const [loading, setLoading] = useState(false);
  const [showCropper, setShowCropper] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    memberFullName: "",
    memberEmail: "",
    memberPhone: "",
    memberAddress: "",
    memberDesc: "",
    specialization: "",
    location: "",
  });

  const { data: memberData, refetch } = useQuery(GET_MEMBER, {
    variables: { targetId: user?._id },
    skip: !user?._id,
    fetchPolicy: "cache-and-network",
  });

  const [updateMember] = useMutation(UPDATE_MEMBER);

  useEffect(() => {
    if (memberData?.getMember) {
      const member = memberData.getMember;
      setFormData({
        memberFullName: member.memberFullName || "",
        memberEmail: member.memberEmail || "",
        memberPhone: member.memberPhone || "",
        memberAddress: member.memberAddress || "",
        memberDesc: member.memberDesc || "",
        specialization: member.specialization || "",
        location: member.location || "",
      });
    }
  }, [memberData]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setShowCropper(true);
    }
  };

  const handleImageCrop = async (croppedFile: File) => {
    // Upload image first, then update member
    // This would need image upload mutation
    setShowCropper(false);
    setImageFile(null);
    // For now, just update other fields
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const updateInput: MemberUpdate = {
        memberFullName: formData.memberFullName.trim(),
        memberEmail: formData.memberEmail.trim(),
        memberPhone: formData.memberPhone.trim(),
        memberAddress: formData.memberAddress.trim(),
        memberDesc: formData.memberDesc.trim(),
      };

      if (formData.specialization) {
        updateInput.specialization = formData.specialization as DoctorSpecialization;
      }

      await updateMember({
        variables: { input: updateInput },
      });

      await sweetMixinSuccessAlert("Profile updated successfully!");
      refetch();
    } catch (error: any) {
      console.error("Update error:", error);
      await sweetMixinErrorAlert(
        error.message || "Failed to update profile. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const currentMember = memberData?.getMember || user;

  return (
    <div className="mypage-section">
      <div className="section-header">
        <h2>Personal Information</h2>
        <p>Update your personal details and profile information</p>
      </div>

      <div className="personal-info-content">
        <div className="profile-image-section">
          <div className="profile-image-wrapper">
            <Image
              src={getImageUrl(currentMember?.memberImage) || "/images/users/defaultUser.svg"}
              alt={currentMember?.memberFullName || "Profile"}
              width={150}
              height={150}
              style={{
                borderRadius: "50%",
                objectFit: "cover",
              }}
            />
            <div className="image-overlay">
              <label htmlFor="image-upload" className="upload-btn">
                <i className="ri-camera-line"></i>
                Change Photo
              </label>
              <input
                type="file"
                id="image-upload"
                accept="image/*"
                onChange={handleImageSelect}
                style={{ display: "none" }}
              />
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="personal-info-form">
          <div className="row">
            <div className="col-md-6">
              <div className="form-group">
                <label>Full Name <span>*</span></label>
                <input
                  type="text"
                  name="memberFullName"
                  className="form-control"
                  value={formData.memberFullName}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="col-md-6">
              <div className="form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  name="memberEmail"
                  className="form-control"
                  value={formData.memberEmail}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="col-md-6">
              <div className="form-group">
                <label>Phone Number</label>
                <input
                  type="text"
                  name="memberPhone"
                  className="form-control"
                  value={formData.memberPhone}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>
            </div>

            {user?.memberType === "DOCTOR" && (
              <div className="col-md-6">
                <div className="form-group">
                  <label>Specialization</label>
                  <select
                    name="specialization"
                    className="form-control form-select"
                    value={formData.specialization}
                    onChange={handleChange}
                    disabled={loading}
                  >
                    <option value="">Select Specialization</option>
                    {Object.values(DoctorSpecialization).map((spec) => (
                      <option key={spec} value={spec}>
                        {spec}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            <div className="col-md-12">
              <div className="form-group">
                <label>Address</label>
                <input
                  type="text"
                  name="memberAddress"
                  className="form-control"
                  value={formData.memberAddress}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="col-md-12">
              <div className="form-group">
                <label>Description / Bio</label>
                <textarea
                  name="memberDesc"
                  className="form-control"
                  rows={5}
                  value={formData.memberDesc}
                  onChange={handleChange}
                  placeholder="Tell us about yourself..."
                  disabled={loading}
                ></textarea>
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="default-btn" disabled={loading}>
              {loading ? "Updating..." : "Update Profile"}
            </button>
          </div>
        </form>
      </div>

      {showCropper && imageFile && (
        <ImageCropper
          imageFile={imageFile}
          onCrop={handleImageCrop}
          onCancel={() => {
            setShowCropper(false);
            setImageFile(null);
          }}
        />
      )}
    </div>
  );
};

export default PersonalInfo;

