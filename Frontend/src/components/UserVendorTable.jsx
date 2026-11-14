
function UserVendorTable({
  users = [],
  loading = false,
  onDelete,
  showStoreName = false,
}) {
  return (
    <div className="card border-0 shadow-sm rounded-4">
      <div className="card-body p-3 p-md-4">
        {loading ? (
          <p className="text-secondary">Loading...</p>
        ) : users.length === 0 ? (
          <p className="text-secondary mb-0">
            No records available.
          </p>
        ) : (
          <div className="table-responsive">
            <table className="table align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th className="py-3">Name</th>
                  <th>Email</th>
                  <th>Mobile</th>

                  {showStoreName && <th>Store Name</th>}

                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {users.map((item) => (
                  <tr key={item._id}>
                    <td className="fw-semibold">
                      {item.name}
                    </td>

                    <td>{item.email}</td>

                    <td>{item.mobile || "-"}</td>

                    {showStoreName && (
                      <td>
                        {item.vendorDetails?.storeName || "-"}
                      </td>
                    )}

                    <td>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-danger"
                        title="Delete account"
                        onClick={() => onDelete?.(item._id)}
                      >
                        <i className="bi bi-trash"></i>
                        <span className="ms-1">Delete</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default UserVendorTable;
