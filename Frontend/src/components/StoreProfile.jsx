
function StoreProfile({ vendor }) {
  if (!vendor) {
    return (
      <div className="alert alert-info">
        Store details not available.
      </div>
    );
  }

  const details = vendor.vendorDetails || {};

  const fields = [
    {
      label: "Store Name",
      value: details.storeName,
      icon: "bi-shop"
    },
    {
      label: "Contact Person",
      value: vendor.name,
      icon: "bi-person"
    },
    {
      label: "Business Email",
      value: vendor.email,
      icon: "bi-envelope"
    },
    {
      label: "Mobile Number",
      value: vendor.mobile,
      icon: "bi-telephone"
    },
    {
      label: "Business Address",
      value: details.businessAddress,
      icon: "bi-geo-alt"
    },
    {
      label: "City",
      value: details.city,
      icon: "bi-building"
    },
    {
      label: "State",
      value: details.state,
      icon: "bi-map"
    },
    {
      label: "Postal Code",
      value: details.postalCode,
      icon: "bi-mailbox"
    }
  ];

  return (
    <div className="container-fluid px-0">
      <div className="card border-0 shadow-sm rounded-4">
        <div className="card-body p-4 p-md-5">

          <div className="d-flex align-items-center gap-3 mb-4">
            <div
              className="rounded-3 p-3"
              style={{
                backgroundColor: "#fff0f5",
                color: "#e91e63"
              }}
            >
              <i className="bi bi-shop fs-3"></i>
            </div>

            <div>
              <h4 className="fw-bold mb-1">Store Profile</h4>
              <p className="text-secondary mb-0">
                Your registered business information
              </p>
            </div>
          </div>

          <hr className="text-secondary opacity-25 mb-4" />

          <div className="row g-4">
            {fields.map((field) => (
              <div className="col-md-6 col-xl-4" key={field.label}>
                <div className="d-flex align-items-start gap-3">
                  <div
                    className="rounded-3 p-2"
                    style={{
                      backgroundColor: "#fff0f5",
                      color: "#e91e63"
                    }}
                  >
                    <i className={`bi ${field.icon} fs-5`}></i>
                  </div>

                  <div className="overflow-hidden">
                    <small className="text-secondary">
                      {field.label}
                    </small>

                    <div className="fw-semibold text-dark text-break">
                      {field.value || "Not provided"}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}

export default StoreProfile;
