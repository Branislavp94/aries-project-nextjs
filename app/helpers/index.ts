export const isDateNotBetweenMarch21AndApril19 = (date: string | undefined): boolean => {
  if (!date) {
    // Handle the case where date is undefined or null
    return false;
  }

  // Assuming date is in the format "YYYY-MM-DD"
  const parsedDate = new Date(date);
  const march21 = new Date(parsedDate.getFullYear(), 2, 21); // Month is zero-based
  const april19 = new Date(parsedDate.getFullYear(), 3, 19); // Month is zero-based

  return parsedDate < march21 || parsedDate > april19;
}


export const validateForm = (data: { validatorKey: string }) => {
  let message

  switch (data.validatorKey) {
    case 'isEmail':
      message = 'Please enter correct Email Address'
      break;
    case 'not_unique':
      message = 'The email address alredy exist'
      break;
    case 'is':
      message = 'Password must be between 8 and 16 characters and  mix of upper/lowercase letters, number and special chars'
      break;
    default:
      break;
  }

  return message
}