import { useCallback, useContext, useEffect, useState } from "react";
import { Toggle, Typography } from "@humansignal/ui";
import { ProjectContext } from "../../providers/ProjectProvider";
import { useAPI } from "@humansignal/core";
import "./settings.scss";

export const ContributorsSettings = () => {
  const { project } = useContext(ProjectContext);
  const api = useAPI();
  const [contributors, setContributors] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch contributors list
  const fetchContributors = useCallback(async () => {
    if (!project?.id) return;

    try {
      setLoading(true);
      const response = await api.callApi("projectContributors", {
        params: {
          pk: project.id,
        },
      });
      if (response) {
        setContributors(response);
      }
    } catch (error) {
      console.error("Failed to fetch contributors:", error);
    } finally {
      setLoading(false);
    }
  }, [project?.id, api]);

  useEffect(() => {
    fetchContributors();
  }, [fetchContributors]);

  // Toggle contributor assignment
  const handleToggle = useCallback(async (userId, currentEnabled) => {
    try {
      const response = await api.callApi("updateProjectContributor", {
        params: {
          pk: project.id,
        },
        body: {
          id: userId,
          enabled: !currentEnabled,
        },
      });

      if (response) {
        // Update local state
        setContributors(prev =>
          prev.map(contributor =>
            contributor.id === userId
              ? { ...contributor, enabled: !currentEnabled }
              : contributor
          )
        );
      }
    } catch (error) {
      console.error("Failed to update contributor:", error);
    }
  }, [project?.id, api]);

  if (loading) {
    return (
      <div className="w-full max-w-4xl">
        <div className="p-6">
          <h1 className="text-2xl font-medium mb-4 text-[#1f1f1f]">Contributors</h1>
          <Typography>Loading contributors...</Typography>
        </div>
      </div>
    );
  }

  if (contributors.length === 0) {
    return (
      <div className="w-full max-w-4xl">
        <div className="p-6">
          <h1 className="text-2xl font-medium mb-4 text-[#1f1f1f]">Contributors</h1>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <Typography>No contributors found in your organization.</Typography>
            <Typography size="small" className="mt-2 text-gray-500">
              Contributors are users with the "Contributor" role. They can only access projects assigned to them.
            </Typography>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl">
      <div className="p-6">
        <h1 className="text-2xl font-medium mb-2 text-[#1f1f1f]">Contributors</h1>
        <Typography className="mb-6 text-gray-600">
          Manage which contributors have access to this project.
        </Typography>

        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50">
              <tr className="border-b border-gray-200">
                <th className="py-3 px-6 font-medium text-gray-600 text-sm uppercase tracking-wider">Email</th>
                <th className="py-3 px-6 font-medium text-gray-600 text-sm uppercase tracking-wider text-right">Access</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {contributors.map((contributor) => (
                <tr key={contributor.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-6 text-gray-800 font-medium">{contributor.email}</td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex justify-end items-center gap-2">
                       <span className={`text-sm ${contributor.enabled ? 'text-green-600 font-medium' : 'text-gray-400'}`}>
                        {contributor.enabled ? 'Active' : 'Inactive'}
                      </span>
                      <Toggle
                        checked={contributor.enabled}
                        onChange={() => handleToggle(contributor.id, contributor.enabled)}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

ContributorsSettings.menuItem = "Contributors";
ContributorsSettings.path = "/contributors";
ContributorsSettings.exact = true;
