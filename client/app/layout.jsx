import '../src/index.css';

export const metadata = {
  title: 'MediSlot | Smarter Healthcare, Better Visits',
  description: 'Find doctors, book appointments, and follow clinic queues with MediSlot.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
