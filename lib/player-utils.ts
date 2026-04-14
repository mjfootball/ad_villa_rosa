export function getAge(dob?: string | null) {
  if (!dob) return null;

  const birth = new Date(dob);
  const today = new Date();

  let age = today.getFullYear() - birth.getFullYear();

  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age--;
  }

  return age;
}

export function getCategory(age: number | null) {
  if (age === null) return null;

  if (age <= 6) return "U7";
  if (age <= 7) return "U8";
  if (age <= 8) return "U9";
  if (age <= 9) return "U10";
  if (age <= 10) return "U11";
  if (age <= 11) return "U12";
  if (age <= 12) return "U13";
  if (age <= 13) return "U14";
  if (age <= 14) return "U15";
  if (age <= 15) return "U16";
  if (age <= 16) return "U17";
  if (age <= 17) return "U18";

  return "Senior";
}