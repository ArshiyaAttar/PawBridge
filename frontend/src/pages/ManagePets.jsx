import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import API from "../services/api";

export default function ManagePets() {
  const location = useLocation();
  const [pets, setPets] = useState([]);
  const [message, setMessage] = useState(location.state?.message || "");
  const [error, setError] = useState("");

  const load = async () => {
    try {
      const { data } = await API.get("/pets/mine");
      setPets(data.pets || []);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load pets.");
    }
  };

  useEffect(() => {
    load();
  }, []);

  const remove = async (id) => {
    if (!window.confirm("Remove this pet listing?")) return;

    try {
      await API.delete(`/pets/${id}`);
      setMessage("Pet listing removed.");
      await load();
    } catch (err) {
      setMessage(err.response?.data?.message || "Unable to remove pet.");
    }
  };

  return (
    <main className="container paw-section">
      <h1 className="section-title">
        My <span>pet listings</span>
      </h1>

      <Link to="/list-pet" className="btn paw-primary mb-4">
        + Add pet
      </Link>

      {message && <div className="alert alert-info">{message}</div>}
      {error && <div className="alert alert-danger">{error}</div>}

      <div className="table-responsive">
        <table className="table align-middle">
          <thead>
            <tr>
              <th>Pet</th>
              <th>Species</th>
              <th>Location</th>
              <th>Listing review</th>
              <th>Pet status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {pets.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center py-4">
                  No pet listings found.
                </td>
              </tr>
            ) : (
              pets.map((pet) => (
                <tr key={pet._id}>
                  <td>{pet.name}</td>
                  <td>{pet.species}</td>
                  <td>{pet.location}</td>
                  <td>
                    <span className={`badge ${
                      pet.listingApprovalStatus === "Approved"
                        ? "text-bg-success"
                        : pet.listingApprovalStatus === "Rejected"
                        ? "text-bg-danger"
                        : "text-bg-warning"
                    }`}>
                      {pet.listingApprovalStatus || "Approved"}
                    </span>
                    {pet.listingReviewNotes && (
                      <div className="small text-muted mt-1">{pet.listingReviewNotes}</div>
                    )}
                  </td>
                  <td>{pet.status}</td>
                  <td>
                    <div className="d-flex gap-2">
                      <Link
                        className="btn btn-sm btn-outline-success"
                        to={`/my-listings/${pet._id}/edit`}
                      >
                        Edit
                      </Link>

                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => remove(pet._id)}
                      >
                        Remove
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}