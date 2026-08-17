async function main() {
  try {
    const res1 = await fetch('http://localhost:5000/api/parcels');
    console.log('GET /api/parcels status:', res1.status);
    console.log('GET /api/parcels body:', await res1.json());

    const res2 = await fetch('http://localhost:5000/api/parcels/1');
    console.log('GET /api/parcels/1 status:', res2.status);
    console.log('GET /api/parcels/1 body:', await res2.json());
  } catch (err) {
    console.error('Error:', err);
  }
}
main();
