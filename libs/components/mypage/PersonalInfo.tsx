import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { useReactiveVar } from "@apollo/client";
import { userVar } from "@/apollo/store";
import { useMutation, useQuery } from "@apollo/client";
import { UPDATE_MEMBER, IMAGE_UPLOADER, LOGIN } from "@/apollo/user/mutation";
import { GET_MEMBER } from "@/apollo/user/query";
import { sweetMixinErrorAlert, sweetMixinSuccessAlert } from "@/libs/sweetAlert";
import { getImageUrl } from "@/libs/imageHelper";
import { MemberUpdate } from "@/libs/types/member/member.update";
import ImageCropper from "@/libs/components/common/ImageCropper";
import { DoctorSpecialization, MemberType } from "@/libs/enums/member.enum";
import { Location } from "@/libs/enums/appointment.enum";
import { updateUserInfoFromResponse } from "@/libs/auth";
import { initializeApollo } from "@/apollo/client";
import { Button } from "@mui/material";
import { Messages } from "@/libs/config";
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import IconButton from "@mui/material/IconButton";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { GET_CLINICS } from "@/apollo/user/query";
import { ClinicsInquiry } from "@/libs/types/member/member.input";
import { Member } from "@/libs/types/member/member";

const PersonalInfo: React.FC = () => {
  const user = useReactiveVar(userVar);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [cropperOpen, setCropperOpen] = useState(false);
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    memberNick: "",
    memberFullName: "",
    memberEmail: "",
    memberPhone: "",
    memberAddress: "",
    memberDesc: "",
    specialization: "",
    clinicId: "",
    location: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [initialData, setInitialData] = useState({
    memberNick: "",
    memberFullName: "",
    memberEmail: "",
    memberPhone: "",
    memberAddress: "",
    memberDesc: "",
    specialization: "",
    clinicId: "",
    memberImage: "",
    location: null as string | null,
  });

  const isClinic = user?.memberType === MemberType.CLINIC;

  const [removeImage, setRemoveImage] = useState(false);
  const emptyFormState = {
    memberNick: "",
    memberFullName: "",
    memberEmail: "",
    memberPhone: "",
    memberAddress: "",
    memberDesc: "",
    specialization: "",
    clinicId: "",
    location: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  };

  const { data: memberData, refetch } = useQuery(GET_MEMBER, {
    variables: { 
      targetId: user?._id,
      includeLocation: isClinic,
    },
    skip: !user?._id,
    fetchPolicy: "cache-and-network",
  });

  const isDoctor = user?.memberType === MemberType.DOCTOR;
  
  const clinicsInput: ClinicsInquiry = {
    page: 1,
    limit: 100,
    sort: 'createdAt',
    direction: 'ASC',
    search: {},
  };

  const { data: clinicsData, loading: clinicsLoading } = useQuery(GET_CLINICS, {
    variables: { input: clinicsInput },
    skip: !isDoctor,
    fetchPolicy: "cache-and-network",
  });

  const clinics: Member[] = clinicsData?.getClinics?.list || [];

  const [updateMember] = useMutation(UPDATE_MEMBER);
  const [uploadImage] = useMutation(IMAGE_UPLOADER);
  const [verifyLogin] = useMutation(LOGIN);

  useEffect(() => {
    if (memberData?.getMember) {
      const member = memberData.getMember;
      // Only store location if it's a valid enum value, not empty string
      // Only clinics should have location - USERS and DOCTORS should never have it
      const memberLocation = (member.memberType === MemberType.CLINIC && member.location && member.location !== "" && member.location !== null)
        ? member.location 
        : null;
      
      const initial = {
        memberNick: member.memberNick || "",
        memberFullName: member.memberFullName || "",
        memberEmail: member.memberEmail || "",
        memberPhone: member.memberPhone || "",
        memberAddress: member.memberAddress || "",
        memberDesc: member.memberDesc || "",
        specialization: member.specialization || "",
        clinicId: member.clinicId || "",
        memberImage: member.memberImage || "",
        location: memberLocation,
      };
      setInitialData(initial);
      // Set form data to empty strings so placeholders show current values
      setFormData(emptyFormState);
    }
  }, [memberData]);

  useEffect(() => {
    if (isEditing) {
      setFormData({
        memberNick: initialData.memberNick || "",
        memberFullName: initialData.memberFullName || "",
        memberEmail: initialData.memberEmail || "",
        memberPhone: initialData.memberPhone || "",
        memberAddress: initialData.memberAddress || "",
        memberDesc: initialData.memberDesc || "",
        specialization: initialData.specialization || "",
        clinicId: initialData.clinicId || "",
        location: initialData.location || "",
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } else {
      setFormData(emptyFormState);
      setSelectedImage(null);
      setImagePreview(null);
      setRemoveImage(false);
    }
  }, [isEditing, initialData]);

  // Check if there are any changes
  // Since fields start empty, a change means the field has a value that differs from initial
  const hasChanges = useMemo(() => {
    if (selectedImage || imagePreview || removeImage) return true; // Image was selected or removed
    const wantsPasswordChange = !!(formData.newPassword.trim() || formData.confirmPassword.trim() || formData.currentPassword.trim());
    
    return (
      (formData.memberFullName.trim() && formData.memberFullName.trim() !== initialData.memberFullName) ||
      (formData.memberNick.trim() && formData.memberNick.trim() !== initialData.memberNick) ||
      (formData.memberEmail.trim() && formData.memberEmail.trim() !== initialData.memberEmail) ||
      (formData.memberPhone.trim() && formData.memberPhone.trim() !== initialData.memberPhone) ||
      (formData.memberAddress.trim() && formData.memberAddress.trim() !== initialData.memberAddress) ||
      (formData.memberDesc.trim() && formData.memberDesc.trim() !== initialData.memberDesc) ||
      (formData.specialization && formData.specialization !== initialData.specialization) ||
      (formData.clinicId && formData.clinicId !== initialData.clinicId) ||
      (isClinic && formData.location && formData.location !== (initialData.location || "")) ||
      (wantsPasswordChange && formData.newPassword.trim() === formData.confirmPassword.trim())
    );
  }, [formData, initialData, selectedImage, imagePreview, removeImage, isClinic]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
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
    setCropperOpen(false);
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
      console.warn('Image upload error (handled):', error);
      await sweetMixinErrorAlert('Failed to upload image. Please try again.');
      return null;
    } finally {
      setUploadingImage(false);
    }
  };

  const passwordValidation = useMemo(() => {
    const newPass = formData.newPassword.trim();
    const confirm = formData.confirmPassword.trim();
    const current = formData.currentPassword.trim();
    const wantsChange = !!(newPass || confirm);
    const newValid = newPass.length >= 6;
    const confirmValid = confirm.length > 0 && confirm === newPass && newValid;
    const currentValid = wantsChange ? current.length > 0 : true;
    return { newValid, confirmValid, currentValid, wantsChange };
  }, [formData.newPassword, formData.confirmPassword, formData.currentPassword]);

  const getPasswordBorder = (field: "current" | "new" | "confirm") => {
    const defaultBorder = "#e0e0e0";
    if (field === "current") {
      if (!passwordValidation.wantsChange) return defaultBorder;
      return passwordValidation.currentValid ? "#4caf50" : "#f44336";
    }
    if (field === "new") {
      if (formData.newPassword.trim().length === 0) return defaultBorder;
      return passwordValidation.newValid ? "#4caf50" : "#f44336";
    }
    if (formData.confirmPassword.trim().length === 0) return defaultBorder;
    return passwordValidation.confirmValid ? "#4caf50" : "#f44336";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!hasChanges) {
      await sweetMixinErrorAlert("No changes to save");
      return;
    }

    const wantsPasswordChange = !!(formData.newPassword.trim() || formData.confirmPassword.trim() || formData.currentPassword.trim());
    if (wantsPasswordChange) {
      if (!formData.currentPassword.trim()) {
        await sweetMixinErrorAlert("Please enter your current password to make changes.");
        return;
      }
      if (!formData.newPassword.trim() || !formData.confirmPassword.trim()) {
        await sweetMixinErrorAlert("Please enter and confirm your new password.");
        return;
      }
      if (formData.newPassword.trim() !== formData.confirmPassword.trim()) {
        await sweetMixinErrorAlert("New password and confirmation do not match.");
        return;
      }
      if (formData.newPassword.trim().length < 6) {
        await sweetMixinErrorAlert("New password must be at least 6 characters.");
        return;
      }
    }

    setLoading(true);

    try {
      if (wantsPasswordChange) {
        // Verify current password via login mutation (no navigation)
        await verifyLogin({
          variables: {
            input: {
              memberNick: currentMember?.memberNick,
              memberPassword: formData.currentPassword,
            },
          },
          fetchPolicy: 'no-cache',
        });
      }

      // Upload image first if selected
      let imageUrl: string | null = null;
      if (selectedImage) {
        imageUrl = await uploadMemberImage(selectedImage);
        if (!imageUrl) {
          setLoading(false);
          return; // Stop if image upload failed
        }
      }

      // Build finalUpdateInput directly - only include fields we want to update
      // Include location ONLY for clinics, and only if it's a valid enum value
      // Use plain object type to avoid TypeScript including location from MemberUpdate type
      const finalUpdateInput: {
        memberFullName?: string;
        memberNick?: string;
        memberEmail?: string;
        memberPhone?: string;
        memberAddress?: string;
        memberDesc?: string;
        specialization?: DoctorSpecialization;
        clinicId?: string;
        memberImage?: string;
        location?: Location; // Only for clinics
        memberPassword?: string;
      } = {};

      // Only include fields that have changed (compare with initial data)
      // If field is empty, it means user wants to keep current value, so don't include it
      if (formData.memberFullName.trim() && formData.memberFullName.trim() !== initialData.memberFullName) {
        finalUpdateInput.memberFullName = formData.memberFullName.trim();
      }
      if (formData.memberNick.trim() && formData.memberNick.trim() !== initialData.memberNick) {
        finalUpdateInput.memberNick = formData.memberNick.trim();
      }
      if (formData.memberEmail.trim() && formData.memberEmail.trim() !== initialData.memberEmail) {
        finalUpdateInput.memberEmail = formData.memberEmail.trim();
      }
      if (formData.memberPhone.trim() && formData.memberPhone.trim() !== initialData.memberPhone) {
        finalUpdateInput.memberPhone = formData.memberPhone.trim();
      }
      if (formData.memberAddress.trim() && formData.memberAddress.trim() !== initialData.memberAddress) {
        finalUpdateInput.memberAddress = formData.memberAddress.trim();
      }
      if (formData.memberDesc.trim() && formData.memberDesc.trim() !== initialData.memberDesc) {
        finalUpdateInput.memberDesc = formData.memberDesc.trim();
      }
      if (formData.specialization && formData.specialization !== initialData.specialization) {
        finalUpdateInput.specialization = formData.specialization as DoctorSpecialization;
      }

      // Handle image removal or upload
      if (removeImage) {
        finalUpdateInput.memberImage = ""; // Empty string to remove image
      } else if (imageUrl) {
        finalUpdateInput.memberImage = imageUrl;
      }

      if (wantsPasswordChange) {
        finalUpdateInput.memberPassword = formData.newPassword.trim();
      }

      // Add clinic change for doctors
      if (isDoctor && formData.clinicId !== initialData.clinicId) {
        finalUpdateInput.clinicId = formData.clinicId || undefined;
      }

      // CRITICAL: Explicitly ensure location is NEVER in the object
      // GraphQL will validate enum even if it's an empty string, causing errors
      if ('location' in finalUpdateInput) {
        delete (finalUpdateInput as any).location;
      }
      
      // Double-check: Remove location if it exists (should never happen, but safety check)
      Object.keys(finalUpdateInput).forEach(key => {
        if (key === 'location') {
          delete (finalUpdateInput as any)[key];
        }
      });

      // Only update if there are actual changes
      if (Object.keys(finalUpdateInput).length === 0 && !imageUrl && !removeImage) {
        await sweetMixinErrorAlert("No changes to save");
        setLoading(false);
        return;
      }

      // Debug: Log what we're sending
      console.log('Sending updateMember with:', JSON.stringify(finalUpdateInput, null, 2));
      console.log('Location in finalUpdateInput?', 'location' in finalUpdateInput);
      console.log('finalUpdateInput keys:', Object.keys(finalUpdateInput));
      
      // Final safety check - if location is somehow still there for non-clinics, remove it
      if (!isClinic && 'location' in finalUpdateInput) {
        console.warn('ERROR: location found in finalUpdateInput for non-clinic! Removing it...');
        delete (finalUpdateInput as any).location;
      }

      // Build a completely clean object with ONLY the fields we want
      // Create object literal directly - no type inference that might include location
      const cleanInput: any = {};
      
      // Only add fields that are explicitly defined - one by one
      if (finalUpdateInput.memberFullName !== undefined) {
        cleanInput.memberFullName = finalUpdateInput.memberFullName;
      }
      if (finalUpdateInput.memberNick !== undefined) {
        cleanInput.memberNick = finalUpdateInput.memberNick;
      }
      if (finalUpdateInput.memberEmail !== undefined) {
        cleanInput.memberEmail = finalUpdateInput.memberEmail;
      }
      if (finalUpdateInput.memberPhone !== undefined) {
        cleanInput.memberPhone = finalUpdateInput.memberPhone;
      }
      if (finalUpdateInput.memberAddress !== undefined) {
        cleanInput.memberAddress = finalUpdateInput.memberAddress;
      }
      if (finalUpdateInput.memberDesc !== undefined) {
        cleanInput.memberDesc = finalUpdateInput.memberDesc;
      }
      if (finalUpdateInput.memberPassword !== undefined) {
        cleanInput.memberPassword = finalUpdateInput.memberPassword;
      }
      if (finalUpdateInput.specialization !== undefined && finalUpdateInput.specialization !== null) {
        cleanInput.specialization = finalUpdateInput.specialization;
      }
      if (finalUpdateInput.clinicId !== undefined) {
        cleanInput.clinicId = finalUpdateInput.clinicId;
      }
      if (finalUpdateInput.memberImage !== undefined) {
        cleanInput.memberImage = finalUpdateInput.memberImage;
      }
      // ONLY include location for clinics, and only if it's a valid enum value
      if (isClinic && finalUpdateInput.location !== undefined) {
        const locationValue = finalUpdateInput.location;
        if (Object.values(Location).includes(locationValue as Location)) {
          cleanInput.location = locationValue;
        }
      }

      // CRITICAL: Verify location is NOT in cleanInput for non-clinics
      if (!isClinic && 'location' in cleanInput) {
        console.warn('CRITICAL ERROR: location found in cleanInput for non-clinic!', cleanInput);
        delete cleanInput.location;
      }

      console.log('Clean input (after filtering):', JSON.stringify(cleanInput, null, 2));
      console.log('Location in cleanInput?', 'location' in cleanInput);
      console.log('cleanInput keys:', Object.keys(cleanInput));

      // Use JSON.parse(JSON.stringify()) to create a completely fresh object
      // This strips any hidden properties, getters, or prototype chain issues
      const sanitizedInput = JSON.parse(JSON.stringify(cleanInput));
      
      // Final check - location should NEVER be in sanitizedInput
      if ('location' in sanitizedInput) {
        console.warn('CRITICAL: location still in sanitizedInput after JSON serialization!');
        delete sanitizedInput.location;
      }

      // Remove any undefined or null values that might cause issues
      Object.keys(sanitizedInput).forEach(key => {
        if (sanitizedInput[key] === undefined || sanitizedInput[key] === null) {
          delete sanitizedInput[key];
        }
        // Extra safety: remove location if it somehow exists for non-clinics
        if (!isClinic && key === 'location') {
          delete sanitizedInput[key];
        }
      });

      console.log('Sanitized input (final):', JSON.stringify(sanitizedInput, null, 2));
      console.log('Sanitized keys:', Object.keys(sanitizedInput));
      console.log('Location in sanitized?', 'location' in sanitizedInput);

      // CRITICAL FIX: Create a completely new object with only the exact fields we want
      // This prevents Apollo Client from auto-including location based on the GraphQL schema
      const mutationInput: any = {
        _id: currentMember?._id, // ensure backend can target the correct member
      };
      const allowedFields = ['memberFullName', 'memberNick', 'memberEmail', 'memberPhone', 'memberAddress', 'memberDesc', 'specialization', 'clinicId', 'memberImage', 'memberPassword'];
      
      // Only include location for CLINICS, and only if it's a valid enum value
      if (isClinic && finalUpdateInput.location !== undefined) {
        const locationValue = finalUpdateInput.location;
        if (Object.values(Location).includes(locationValue as Location)) {
          allowedFields.push('location');
        }
      }
      
      allowedFields.forEach(field => {
        if (sanitizedInput[field] !== undefined && sanitizedInput[field] !== null) {
          // For location, only include if it's a valid enum value
          if (field === 'location') {
            const locationValue = sanitizedInput[field] as string;
            if (locationValue && Object.values(Location).includes(locationValue as Location)) {
              mutationInput[field] = locationValue as Location;
            }
          } else {
            mutationInput[field] = sanitizedInput[field];
          }
        }
      });

      // Drop _id if it's not available
      if (!mutationInput._id) {
        delete mutationInput._id;
      }

      // CRITICAL: For USERS and DOCTORS, location should NEVER be in mutationInput
      // Even if it somehow got into sanitizedInput, remove it for non-clinics
      // This is the final safety check before sending to GraphQL
      if (!isClinic) {
        if ('location' in mutationInput) {
          console.warn('CRITICAL: location found in mutationInput for non-clinic! Removing it...');
          delete mutationInput.location;
        }
        // Double-check after deletion
        if ('location' in mutationInput) {
          console.warn('CRITICAL: location still in mutationInput after removal!');
          delete mutationInput.location;
        }
      }
      
      // Final verification - location should NEVER be in mutationInput for non-clinics
      // Use Object.keys to ensure location is completely removed
      if (!isClinic) {
        const keys = Object.keys(mutationInput);
        if (keys.includes('location')) {
          console.warn('CRITICAL: location found in mutationInput keys for non-clinic!');
          delete mutationInput.location;
        }
      }

      console.log('Mutation input (final check):', JSON.stringify(mutationInput, null, 2));
      console.log('Mutation input keys:', Object.keys(mutationInput));
      console.log('Location in mutationInput?', 'location' in mutationInput);

      // Use the mutation input - it should never have location
      const updateResult = await updateMember({
        variables: { input: mutationInput },
      });

      if (updateResult?.data?.updateMember) {
        const updatedMember = updateResult.data.updateMember;
        updateUserInfoFromResponse(updatedMember);
        
        // Refresh member data to get latest info
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
          // Update initial data to reflect new state
          const member = data.getMember;
          // Only store location if it's a valid enum value, not empty string
          const memberLocation = member.location && member.location !== "" && member.location !== null 
            ? member.location 
            : null;
          
          setInitialData({
            memberNick: member.memberNick || "",
            memberFullName: member.memberFullName || "",
            memberEmail: member.memberEmail || "",
            memberPhone: member.memberPhone || "",
            memberAddress: member.memberAddress || "",
            memberDesc: member.memberDesc || "",
            specialization: member.specialization || "",
            clinicId: member.clinicId || "",
            memberImage: member.memberImage || "",
            location: memberLocation,
          });
        }

        // Reset image states
        setSelectedImage(null);
        setImagePreview(null);
        setRemoveImage(false);
        
        // Update initial data to reflect new state
        if (data?.getMember) {
          const member = data.getMember;
          // Only store location if it's a valid enum value, not empty string
          const memberLocation = member.location && member.location !== "" && member.location !== null 
            ? member.location 
            : null;
          
          setInitialData({
            memberNick: member.memberNick || "",
            memberFullName: member.memberFullName || "",
            memberEmail: member.memberEmail || "",
            memberPhone: member.memberPhone || "",
            memberAddress: member.memberAddress || "",
            memberDesc: member.memberDesc || "",
            specialization: member.specialization || "",
            clinicId: member.clinicId || "",
            memberImage: member.memberImage || "",
            location: memberLocation,
          });
        }
      }

      await sweetMixinSuccessAlert("Profile updated successfully!");
      refetch();
      setIsEditing(false);
    } catch (error: any) {
      console.warn("Update error (handled):", error);
      const errorMessage = typeof error?.message === "string" ? error.message : "";
      if (errorMessage.toLowerCase().includes("duplicate key") || errorMessage.toLowerCase().includes("existing username")) {
        await sweetMixinErrorAlert(Messages.error6);
      } else {
        await sweetMixinErrorAlert(
          errorMessage || "Failed to update profile. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const currentMember = memberData?.getMember || user;
  const displayImage = removeImage 
    ? "/images/users/defaultUser.svg"
    : (imagePreview || getImageUrl(currentMember?.memberImage) || "/images/users/defaultUser.svg");

  const handleRemovePhoto = () => {
    setRemoveImage(true);
    setSelectedImage(null);
    setImagePreview(null);
  };

  const handleEditToggle = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  const renderViewField = (label: string, value?: string | null) => (
    <div style={{ marginBottom: "16px" }}>
      <div style={{ fontWeight: 600, marginBottom: "4px" }}>{label}</div>
      <div style={{ color: "#444" }}>{value && value.trim() !== "" ? value : "—"}</div>
    </div>
  );

  return (
    <div className="mypage-section">
      <div className="section-header">
        <h2>Personal Information</h2>
        <p>Update your personal details and profile information</p>
      </div>

      <div className="personal-info-content" style={{ padding: "30px 0" }}>
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "10px" }}>
          {!isEditing ? (
            <Button
              variant="contained"
              onClick={handleEditToggle}
              sx={{ backgroundColor: '#336AEA', '&:hover': { backgroundColor: '#2856c7' } }}
            >
              Edit Profile
            </Button>
          ) : (
            <Button
              variant="outlined"
              onClick={handleCancelEdit}
              disabled={loading || uploadingImage}
              sx={{ borderColor: '#9e9e9e', color: '#424242' }}
            >
              Cancel
            </Button>
          )}
        </div>

        {!isEditing && (
          <>
            <div className="profile-image-section" style={{ marginBottom: "30px", textAlign: "center" }}>
              <Image
                src={displayImage}
                alt={currentMember?.memberFullName || "Profile"}
                width={150}
                height={150}
                style={{
                  borderRadius: "50%",
                  objectFit: "cover",
                  border: "3px solid #f0f0f0",
                }}
              />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px", marginBottom: "30px" }}>
              {renderViewField("Full Name", initialData.memberFullName)}
              {renderViewField("Nickname", initialData.memberNick)}
              {renderViewField("Email Address", initialData.memberEmail)}
              {renderViewField("Phone Number", initialData.memberPhone)}
              {renderViewField("Address", initialData.memberAddress)}
              {isDoctor && renderViewField("Specialization", initialData.specialization)}
              {isDoctor && renderViewField("Clinic", clinics.find(c => c._id === initialData.clinicId)?.memberFullName)}
              {isClinic && renderViewField("Location", initialData.location)}
            </div>
            {renderViewField("Description / Bio", initialData.memberDesc)}
          </>
        )}

        {isEditing && (
        <>
          <div className="profile-image-section" style={{ marginBottom: "40px", textAlign: "center" }}>
            <div className="profile-image-wrapper" style={{ position: "relative", display: "inline-block" }}>
              <Image
                src={displayImage}
                alt={currentMember?.memberFullName || "Profile"}
                width={150}
                height={150}
                style={{
                  borderRadius: "50%",
                  objectFit: "cover",
                  border: "3px solid #f0f0f0",
                }} />
              <div className="image-overlay" style={{ marginTop: "20px", display: "flex", gap: "10px", justifyContent: "center" }}>
                <Button
                  component="label"
                  variant="contained"
                  tabIndex={-1}
                  startIcon={<CloudUploadIcon />}
                  disabled={loading || uploadingImage}
                  sx={{
                    backgroundColor: '#336AEA',
                    '&:hover': {
                      backgroundColor: '#2856c7',
                    },
                  }}
                >
                  Upload a photo
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    style={{ display: "none" }}
                    disabled={loading || uploadingImage} />
                </Button>
                {currentMember?.memberImage && !removeImage && (
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<DeleteIcon />}
                    onClick={handleRemovePhoto}
                    disabled={loading || uploadingImage}
                    sx={{
                      borderColor: '#f44336',
                      color: '#f44336',
                      '&:hover': {
                        borderColor: '#d32f2f',
                        backgroundColor: '#ffebee',
                      },
                    }}
                  >
                    Remove Photo
                  </Button>
                )}
              </div>
            </div>

            {/* Image Preview and Actions */}
            {imagePreview && (
              <div className="image-preview-section" style={{ marginTop: "20px", textAlign: "center" }}>
                <div style={{ marginBottom: "15px" }}>
                  <Image
                    src={imagePreview}
                    alt="Preview"
                    width={100}
                    height={100}
                    style={{
                      borderRadius: "50%",
                      objectFit: "cover",
                      marginBottom: "10px",
                    }} />
                </div>
                <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
                  <button
                    type="button"
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
                    } }
                    className="crop-image-btn"
                    disabled={loading || uploadingImage}
                  >
                    Edit/Crop Image
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedImage(null);
                      setImagePreview(null);
                    } }
                    className="remove-image-btn"
                    disabled={loading || uploadingImage}
                  >
                    Remove Image
                  </button>
                </div>
              </div>
            )}
            {uploadingImage && (
              <p style={{ textAlign: "center", color: "#666", marginTop: "10px" }}>
                Uploading image...
              </p>
            )}
          </div><form onSubmit={handleSubmit} className="personal-info-form">
              <div className="row" style={{ gap: "20px 0" }}>
                <div className="col-md-6" style={{ padding: "0 15px" }}>
                  <div className="form-group" style={{ marginBottom: "25px" }}>
                    <label style={{ marginBottom: "8px", display: "block", fontWeight: 500 }}>
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="memberFullName"
                      className="form-control"
                      value={formData.memberFullName}
                      onChange={handleChange}
                      placeholder={initialData.memberFullName || "Enter your full name"}
                      disabled={loading || uploadingImage}
                      style={{
                        padding: "12px 15px",
                        borderRadius: "5px",
                        border: "1px solid #e0e0e0",
                        width: "100%",
                      }} />
                  </div>
                </div>

                <div className="col-md-6" style={{ padding: "0 15px" }}>
                  <div className="form-group" style={{ marginBottom: "25px" }}>
                    <label style={{ marginBottom: "8px", display: "block", fontWeight: 500 }}>
                      Username
                    </label>
                    <input
                      type="text"
                      name="memberNick"
                      className="form-control"
                      value={formData.memberNick}
                      onChange={handleChange}
                      placeholder={initialData.memberNick || "Enter your nickname"}
                      disabled={loading || uploadingImage}
                      style={{
                        padding: "12px 15px",
                        borderRadius: "5px",
                        border: "1px solid #e0e0e0",
                        width: "100%",
                      }} />
                  </div>
                </div>

                <div className="col-md-6" style={{ padding: "0 15px" }}>
                  <div className="form-group" style={{ marginBottom: "25px" }}>
                    <label style={{ marginBottom: "8px", display: "block", fontWeight: 500 }}>
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="memberEmail"
                      className="form-control"
                      value={formData.memberEmail}
                      onChange={handleChange}
                      placeholder={initialData.memberEmail || "Enter your email address"}
                      disabled={loading || uploadingImage}
                      style={{
                        padding: "12px 15px",
                        borderRadius: "5px",
                        border: "1px solid #e0e0e0",
                        width: "100%",
                      }} />
                  </div>
                </div>

                <div className="col-md-6" style={{ padding: "0 15px" }}>
                  <div className="form-group" style={{ marginBottom: "25px" }}>
                    <label style={{ marginBottom: "8px", display: "block", fontWeight: 500 }}>
                      Phone Number
                    </label>
                    <input
                      type="text"
                      name="memberPhone"
                      className="form-control"
                      value={formData.memberPhone}
                      onChange={handleChange}
                      placeholder={initialData.memberPhone || "Enter your phone number"}
                      disabled={loading || uploadingImage}
                      style={{
                        padding: "12px 15px",
                        borderRadius: "5px",
                        border: "1px solid #e0e0e0",
                        width: "100%",
                      }} />
                  </div>
                </div>

                {isDoctor && (
                  <>
                    <div className="col-md-6" style={{ padding: "0 15px" }}>
                      <div className="form-group" style={{ marginBottom: "25px" }}>
                        <label style={{ marginBottom: "8px", display: "block", fontWeight: 500 }}>
                          Specialization
                        </label>
                        <select
                          name="specialization"
                          className="form-control form-select"
                          value={formData.specialization}
                          onChange={handleChange}
                          disabled={loading || uploadingImage}
                          style={{
                            padding: "12px 15px",
                            borderRadius: "5px",
                            border: "1px solid #e0e0e0",
                            width: "100%",
                            backgroundColor: "#fff",
                          }}
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
                    <div className="col-md-6" style={{ padding: "0 15px" }}>
                      <div className="form-group" style={{ marginBottom: "25px" }}>
                        <label style={{ marginBottom: "8px", display: "block", fontWeight: 500 }}>
                          Clinic
                        </label>
                        <select
                          name="clinicId"
                          className="form-control form-select"
                          value={formData.clinicId}
                          onChange={handleChange}
                          disabled={loading || uploadingImage || clinicsLoading}
                          style={{
                            padding: "12px 15px",
                            borderRadius: "5px",
                            border: "1px solid #e0e0e0",
                            width: "100%",
                            backgroundColor: "#fff",
                          }}
                        >
                          <option value="">Select Clinic</option>
                          {clinics.map((clinic) => (
                            <option key={clinic._id} value={clinic._id}>
                              {clinic.memberFullName || clinic.memberNick}
                            </option>
                          ))}
                        </select>
                        {clinicsLoading && (
                          <small style={{ color: "#666", marginTop: "5px", display: "block" }}>
                            Loading clinics...
                          </small>
                        )}
                        {!clinicsLoading && clinics.length === 0 && (
                          <small style={{ color: "#666", marginTop: "5px", display: "block" }}>
                            No clinics available
                          </small>
                        )}
                      </div>
                    </div>
                  </>
                )}

                {isClinic && (
                  <div className="col-md-6" style={{ padding: "0 15px" }}>
                    <div className="form-group" style={{ marginBottom: "25px" }}>
                      <label style={{ marginBottom: "8px", display: "block", fontWeight: 500 }}>
                        Location
                      </label>
                      <select
                        name="location"
                        className="form-control form-select"
                        value={formData.location}
                        onChange={handleChange}
                        disabled={loading || uploadingImage}
                        style={{
                          padding: "12px 15px",
                          borderRadius: "5px",
                          border: "1px solid #e0e0e0",
                          width: "100%",
                          backgroundColor: "#fff",
                        }}
                      >
                        <option value="">Select Location</option>
                        {Object.values(Location).map((loc) => (
                          <option key={loc} value={loc}>
                            {loc}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                <div className="col-md-12" style={{ padding: "0 15px" }}>
                  <div className="form-group" style={{ marginBottom: "25px" }}>
                    <label style={{ marginBottom: "8px", display: "block", fontWeight: 500 }}>
                      Address
                    </label>
                    <input
                      type="text"
                      name="memberAddress"
                      className="form-control"
                      value={formData.memberAddress}
                      onChange={handleChange}
                      placeholder={initialData.memberAddress || "Enter your address"}
                      disabled={loading || uploadingImage}
                      style={{
                        padding: "12px 15px",
                        borderRadius: "5px",
                        border: "1px solid #e0e0e0",
                        width: "100%",
                      }} />
                  </div>
                </div>

            <div className="col-md-12" style={{ padding: "0 15px" }}>
              <div className="form-group" style={{ marginBottom: "25px" }}>
                <label style={{ marginBottom: "8px", display: "block", fontWeight: 500 }}>
                  Description / Bio
                </label>
                    <textarea
                      name="memberDesc"
                      className="form-control"
                      rows={5}
                      value={formData.memberDesc}
                      onChange={handleChange}
                      placeholder={initialData.memberDesc || "Tell us about yourself..."}
                      disabled={loading || uploadingImage}
                      style={{
                        padding: "12px 15px",
                        borderRadius: "5px",
                        border: "1px solid #e0e0e0",
                        width: "100%",
                        resize: "vertical",
                      }}
                ></textarea>
              </div>
            </div>

            <div className="col-md-12" style={{ padding: "0 15px" }}>
              <div className="form-group" style={{ marginBottom: "10px" }}>
                <label style={{ fontWeight: 600, display: "block", marginBottom: "8px" }}>
                  Change Password
                </label>
              </div>
            </div>

            <div className="col-md-4" style={{ padding: "0 15px" }}>
              <div className="form-group" style={{ marginBottom: "20px" }}>
                <label style={{ marginBottom: "8px", display: "block", fontWeight: 500 }}>
                  Current Password
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    type={showCurrentPassword ? "text" : "password"}
                    name="currentPassword"
                    className="form-control"
                    value={formData.currentPassword}
                    onChange={handleChange}
                    placeholder="Enter current password"
                    disabled={loading || uploadingImage}
                    style={{
                      padding: "12px 15px",
                      borderRadius: "5px",
                      border: `1px solid ${getPasswordBorder("current")}`,
                      width: "100%",
                      paddingRight: "45px",
                    }}
                  />
                  <IconButton
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    disabled={loading || uploadingImage}
                    aria-label={showCurrentPassword ? "Hide password" : "Show password"}
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
                    {showCurrentPassword ? (
                      <VisibilityOffIcon fontSize="small" />
                    ) : (
                      <VisibilityIcon fontSize="small" />
                    )}
                  </IconButton>
                </div>
              </div>
            </div>

            <div className="col-md-4" style={{ padding: "0 15px" }}>
              <div className="form-group" style={{ marginBottom: "20px" }}>
                <label style={{ marginBottom: "8px", display: "block", fontWeight: 500 }}>
                  New Password
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    type={showNewPassword ? "text" : "password"}
                    name="newPassword"
                    className="form-control"
                    value={formData.newPassword}
                    onChange={handleChange}
                    placeholder="Enter new password"
                    disabled={loading || uploadingImage}
                    style={{
                      padding: "12px 15px",
                      borderRadius: "5px",
                      border: `1px solid ${getPasswordBorder("new")}`,
                      width: "100%",
                      paddingRight: "45px",
                    }}
                  />
                  <IconButton
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    disabled={loading || uploadingImage}
                    aria-label={showNewPassword ? "Hide password" : "Show password"}
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
                    {showNewPassword ? (
                      <VisibilityOffIcon fontSize="small" />
                    ) : (
                      <VisibilityIcon fontSize="small" />
                    )}
                  </IconButton>
                </div>
              </div>
            </div>

            <div className="col-md-4" style={{ padding: "0 15px" }}>
              <div className="form-group" style={{ marginBottom: "20px" }}>
                <label style={{ marginBottom: "8px", display: "block", fontWeight: 500 }}>
                  Confirm New Password
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    className="form-control"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Re-enter new password"
                    disabled={loading || uploadingImage}
                    style={{
                      padding: "12px 15px",
                      borderRadius: "5px",
                      border: `1px solid ${getPasswordBorder("confirm")}`,
                      width: "100%",
                      paddingRight: "45px",
                    }}
                  />
                  <IconButton
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    disabled={loading || uploadingImage}
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
            </div>
          </div>

              <div className="form-actions" style={{ marginTop: "30px", paddingTop: "20px", borderTop: "1px solid #e0e0e0" }}>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading || uploadingImage || !hasChanges}
                  sx={{
                    backgroundColor: '#336AEA',
                    '&:hover': { backgroundColor: '#2856c7' },
                    opacity: (!hasChanges || loading || uploadingImage) ? 0.6 : 1,
                    cursor: (!hasChanges || loading || uploadingImage) ? "not-allowed" : "pointer",
                    minWidth: 180,
                    padding: '12px 18px',
                  }}
                >
                  {loading || uploadingImage ? "Updating..." : "Update Profile"}
                </Button>
              </div>
            </form></>
        )}
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
          aspectRatio={1} // Square crop (1:1) for profile images
        />
      )}
    </div>
  );
};

export default PersonalInfo;
