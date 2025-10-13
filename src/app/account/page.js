import { Suspense } from "react";
import PasswordResetForm from "./PasswordResetForm";
import Loading from "./loading";

export default function AccountPage() {
  return (
    <Suspense fallback={<Loading />}>
      <PasswordResetForm />
    </Suspense>
  );
}
