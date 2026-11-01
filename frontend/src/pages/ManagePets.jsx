import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";

export default function ManagePets() {
  const [pets, setPets] = useState([]);
  const [message, setMessage] = useState("");

  const load = async () => {
    try {
      const { data } = await API.get("/pets/mine");
      setPets(data.pets || []);
    } catch (err) {
      setMessage(err.response?.data?.message || "Unable to load pets.");
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
        Manage <span>pets</span>
      </h1>

      <Link to="/shelter/add-pet" className="btn paw-primary mb-4">
        + Add pet
      </Link>

      {message && <div className="alert alert-info">{message}</div>}

      <div className="table-responsive">
        <table className="table align-middle">
          <thead>
            <tr>
              <th>Pet</th>
              <th>Species</th>
              <th>Location</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {pets.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center py-4">
                  No pet listings found.
                </td>
              </tr>
            ) : (
              pets.map((pet) => (
                <tr key={pet._id}>
                  <td>{pet.name}</td>
                  <td>{pet.species}</td>
                  <td>{pet.location}</td>
                  <td>{pet.status}</td>
                  <td>
                    <div className="d-flex gap-2">
                      <Link
                        className="btn btn-sm btn-outline-success"
                        to={`/shelter/pets/${pet._id}/edit`}
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