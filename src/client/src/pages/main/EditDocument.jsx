import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSupplier } from '../../context/supplierContext';
import { toast } from 'react-toastify';
import Modal from '../../components/Modal';
import { addCollaboratorToDoc, getAllCollaborators } from '../../helpers/docs/doc.helper';
import { useAuth } from '../../context/authContext';
import { API } from '../../helpers/config';
import Editor from './Editor.jsx';

const EditDocument = () => {
    const [currentUsers, setCurrentUsers] = useState([]);
    const [collaboratorEmail, setCollaboratorEmail] = useState('');
    const [collaborators, setCollaborators] = useState([]);
    const [isModified, setIsModified] = useState(false);
    const [exportLoading, setExportLoading] = useState(false);

    const navigate = useNavigate();
    const { auth } = useAuth();
    const { currentDoc, loading, socket, setCurrentDoc, darkMode, triggerUpdate, quill, setLoading } = useSupplier();
    const { id } = useParams();

    const handleAddCollaborator = async () => {
        setLoading(true);
        const res = await addCollaboratorToDoc(currentDoc?._id, collaboratorEmail, auth?.token).finally(() => setLoading(false));
        if (res?.status === 200) {
            setCollaboratorEmail('');
            document.getElementById('closeTheModal').click();
            toast.success(res?.data?.message);
            triggerUpdate();
            return;
        }
        toast.error(res?.data?.message);
    };

    const saveDocumentImmediately = () => {
        if (isModified) {
            socket.emit("save-doc", { docId: currentDoc?._id, data: quill?.getContents() }, (error) => {
                if (error) {
                    console.error(error);
                } else {
                    toast.success('Document saved successfully');
                    setIsModified(false);
                }
            });
        }
    };

    // Export as PDF using browser's print-to-PDF functionality
    const exportToPDF = () => {
        if (!quill) {
            toast.error('Editor not ready for export');
            return;
        }
        
        setExportLoading(true);
        try {
            const content = quill.root.innerHTML;
            const title = currentDoc?.title || 'Document';
            
            // Create a new window with styled content
            const printWindow = window.open('', '_blank');
            printWindow.document.write(`
                <html>
                    <head>
                        <title>${title}</title>
                        <style>
                            body {
                                font-family: Arial, sans-serif;
                                line-height: 1.6;
                                margin: 40px;
                                color: #333;
                            }
                            h1 {
                                text-align: center;
                                margin-bottom: 30px;
                                color: #2c3e50;
                            }
                            .content {
                                margin: 0 auto;
                            }
                            @media print {
                                body {
                                    margin: 20mm;
                                }
                            }
                        </style>
                    </head>
                    <body>
                        <h1>${title}</h1>
                        <div class="content">${content}</div>
                        <script>
                            // Automatically open print dialog when content loads
                            window.onload = function() {
                                document.title = "${title}.pdf";
                                setTimeout(function() {
                                    window.print();
                                    window.onfocus = function() {
                                        setTimeout(function() {
                                            window.close();
                                        }, 500);
                                    };
                                }, 1000);
                            };
                        </script>
                    </body>
                </html>
            `);
            
            printWindow.document.close();
            setExportLoading(false);
            toast.success('PDF export initiated');
            
        } catch (error) {
            console.error('Export error:', error);
            toast.error('Failed to export as PDF');
            setExportLoading(false);
        }
    };

    // Export as text/plain document
    const exportToDocx = () => {
        if (!quill) {
            toast.error('Editor not ready for export');
            return;
        }
        
        setExportLoading(true);
        try {
            // Create a temporary element to get plain text
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = quill.root.innerHTML;
            
            // Get HTML content
            const htmlContent = quill.root.innerHTML;
            const title = currentDoc?.title || 'Document';
            
            // Create a complete HTML document with styles
            const fullHtml = `
                <html xmlns:o="urn:schemas-microsoft-com:office:office" 
                      xmlns:w="urn:schemas-microsoft-com:office:word" 
                      xmlns="http://www.w3.org/TR/REC-html40">
                <head>
                    <meta charset="utf-8">
                    <title>${title}</title>
                    <!--[if gte mso 9]>
                    <xml>
                        <w:WordDocument>
                            <w:View>Print</w:View>
                            <w:Zoom>100</w:Zoom>
                            <w:DoNotOptimizeForBrowser/>
                        </w:WordDocument>
                    </xml>
                    <![endif]-->
                    <style>
                        /* Add Word document styling */
                        body {
                            font-family: 'Calibri', sans-serif;
                            font-size: 12pt;
                            line-height: 1.5;
                        }
                        h1, h2, h3, h4, h5, h6 {
                            font-family: 'Calibri', sans-serif;
                        }
                    </style>
                </head>
                <body>
                    <h1>${title}</h1>
                    ${htmlContent}
                </body>
                </html>
            `;
            
            // Create blob and download
            const blob = new Blob([fullHtml], { type: 'application/msword' });
            const url = URL.createObjectURL(blob);
            
            // Create download link and click it
            const link = document.createElement('a');
            link.href = url;
            link.download = `${title}.doc`;
            document.body.appendChild(link);
            link.click();
            
            // Clean up
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            
            setExportLoading(false);
            toast.success('Document exported successfully');
            
        } catch (error) {
            console.error('Export error:', error);
            toast.error('Failed to export document');
            setExportLoading(false);
        }
    };

    const handlePrint = () => {
        if (!quill) {
            toast.error('Editor not ready for printing');
            return;
        }
        
        const printContent = quill.root.innerHTML;
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html>
                <head>
                    <title>${currentDoc?.title || 'Document'} - Print</title>
                    <style>
                        body { font-family: Arial, sans-serif; padding: 20px; }
                        .ql-editor { width: 100%; margin: 0 auto; }
                    </style>
                </head>
                <body>
                    <h1>${currentDoc?.title || 'Document'}</h1>
                    <div class="ql-editor">${printContent}</div>
                    <script>
                        window.onload = function() {
                            window.print();
                            window.onafterprint = function() {
                                window.close();
                            };
                        }
                    <\/script>
                </body>
            </html>
        `);
        printWindow.document.close();
    };

    useEffect(() => {
        if (quill == null || !currentDoc?._id) return;

        socket.emit("get-doc", { docId: currentDoc?._id });

        socket.once('load-document', document => {
            quill.setContents(document);
            quill.enable();
        });
    }, [quill, socket, currentDoc]);

    // Register document modifications and mark as modified
    useEffect(() => {
        if (quill == null || !currentDoc?._id) return;

        const handleTextChange = (delta, oldDelta, source) => {
            if (source === 'user') {
                setIsModified(true);  // Mark as modified when the user makes changes
            }
        };

        quill.on('text-change', handleTextChange);

        return () => {
            quill.off('text-change', handleTextChange);
        };
    }, [quill, currentDoc]);

    // Check and save only if there are modifications
    useEffect(() => {
        if (quill == null) return;

        const interval = setInterval(() => {
            if (isModified) {
                toast.info('Saving document...');
                socket.emit("save-doc", { docId: currentDoc?._id, data: quill?.getContents() }, (error) => {
                    if (error) {
                        console.error(error);
                    } else {
                        toast.success('Document saved successfully');
                        setIsModified(false);  // After saving, mark as not modified
                    }
                });
            }
        }, 30000);  // Interval to check for modifications

        return () => {
            clearInterval(interval);
        };
    }, [quill, isModified, currentDoc]);

    // Other collaborator and room functionalities
    useEffect(() => {
        const fetchCollaborators = async () => {
            setLoading(true);
            const res = await getAllCollaborators(currentDoc?._id, auth?.token).finally(() => setLoading(false));
            if (res?.status === 200) {
                setCollaborators(res?.data?.collaborators);
            }
        };

        const resetCurrentDocStateOnReload = async () => {
            const fetchDoc = await fetch(`${API}/documents/${id}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${auth?.token}`
                }
            });
            const doc = await fetchDoc.json();
            setCurrentDoc(doc?.document);
        };

        if (!currentDoc && auth?.token) {
            resetCurrentDocStateOnReload();
        }
        if (auth?.token && currentDoc?._id) {
            fetchCollaborators();
        }
    }, [auth, currentDoc]);

    useEffect(() => {
        if (!quill || !currentDoc?._id) return;

        const handler = (delta, oldDelta, source) => {
            if (source !== 'user') return;

            socket.emit('send-changes', { delta, roomId: currentDoc?._id, username: auth?.user?.username });
        };

        quill.on('text-change', handler);

        return () => {
            if (quill) {
                quill.off('text-change', handler);
            }
        };
    }, [quill, socket, currentDoc, auth?.user?.username]);


    useEffect(() => {
        if (quill == null || !currentDoc?._id) return;

        const handleSomeoneJoined = (data) => {
            setCurrentUsers(data?.roomUsers);
        };

        const handleSomeoneLeft = (data) => {
            setCurrentUsers(data?.roomUsers);
        };

        socket.emit('joinRoom', { roomId: currentDoc?._id, username: auth?.user?.username }, (error) => {
            if (error) {
                console.error('Error joining room:', error);
            }
        });

        socket.on('someoneJoined', handleSomeoneJoined);
        socket.on('someoneLeft', handleSomeoneLeft);

        return () => {
            if (quill) {
                quill.disable();
            }

            socket.emit('leaveRoom', { roomId: currentDoc?._id, username: auth?.user?.username }, (error) => {
                if (error) {
                    console.error('Error leaving room:', error);
                }
            });

            socket.off('someoneJoined', handleSomeoneJoined);
            socket.off('someoneLeft', handleSomeoneLeft);
            setCurrentUsers([]);
        };
    }, [currentDoc, socket, auth?.user?.username]);

    useEffect(() => {
        socket.on('receive-changes', (data) => {
            if (data?.username === auth?.user?.username) return;
            quill.updateContents(data?.delta);
        });

        return () => {
            socket.off('receive-changes');
        };
    }, [currentDoc, socket]);



    return (
        <div className={`container-fluid ${darkMode ? 'bg-dark text-light' : 'bg-light text-dark'} vh-100`}>
            <div className="row h-100">
                {/* Sidebar - collapses on smaller screens */}
                <div className={`col-lg-3 col-md-4 col-12 p-3 ${darkMode ? 'bg-dark text-light' : 'bg-light text-dark'}`} style={{ minWidth: '280px' }}>
                    <div className="d-flex align-items-center justify-content-between mb-4">
                        <h4 className="fw-bold">Collaborators</h4>
                        <button
                            type="button"
                            className="btn btn-sm btn-primary"
                            data-bs-toggle="modal"
                            data-bs-target="#addCollaborator"
                        >
                            <i className="bi bi-person-fill-add"></i> Add
                        </button>
                    </div>
                    
                    {/* Online Collaborators List */}
                    <ul className="list-group mb-4">
                        <li className={`list-group-item ${darkMode ? 'bg-dark text-light' : 'bg-secondary text-dark'}`}>
                            <i className="bi bi-people-fill"></i> Online Collaborators ({currentUsers?.length})
                        </li>
                        {currentUsers?.map((user, index) => (
                            <li key={index} className={`list-group-item ${darkMode ? 'bg-dark text-light' : 'bg-light text-dark'}`}>
                                <i className="bi bi-person"></i>&nbsp;{user?.username} {user?.username === auth?.user?.username && '(You)'}
                            </li>
                        ))}
                    </ul>

                    {/* Available Collaborators List */}
                    <ul className="list-group">
                        <li className={`list-group-item ${darkMode ? 'bg-dark text-light' : 'bg-primary text-dark'}`}>
                            <i className="bi bi-person-check-fill"></i> All Collaborators ({collaborators?.length})
                        </li>
                        {collaborators?.map((user, index) => (
                            <li key={index} className={`list-group-item ${darkMode ? 'bg-dark text-light' : 'bg-light text-dark'}`}>
                                <i className="bi bi-person"></i>&nbsp;{user?.username}
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Main Editor Container - expands on smaller screens */}
                <div className="col-lg-9 col-md-8 col-12 p-4">
                    <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4">
                        {/* Back Button */}
                        <button
                            type="button"
                            className={`btn btn-warning mb-2 mb-md-0 ${darkMode ? 'text-light' : ''}`}
                            onClick={() => {
                                saveDocumentImmediately();
                                navigate('/home');
                            }}
                        >
                            <i className="bi bi-arrow-left"></i> Back
                        </button>
                        
                        {/* Document Title */}
                        <h1 className={`display-6 text-center ${darkMode ? 'text-light' : 'text-dark'} mb-2 mb-md-0`}>
                            Document Title: <u>{currentDoc?.title}</u>
                        </h1>

                        <div className="d-flex gap-2">
                            {/* Export Dropdown */}
                            <div className="dropdown">
                                <button
                                    className={`btn btn-primary dropdown-toggle ${exportLoading ? 'disabled' : ''}`}
                                    type="button"
                                    id="exportDropdown"
                                    data-bs-toggle="dropdown"
                                    aria-expanded="false"
                                    disabled={exportLoading}
                                >
                                    {exportLoading ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                            Exporting...
                                        </>
                                    ) : (
                                        <>
                                            <i className="bi bi-file-earmark-arrow-down me-1"></i>
                                            Export
                                        </>
                                    )}
                                </button>
                                <ul className="dropdown-menu" aria-labelledby="exportDropdown">
                                    <li>
                                        <button
                                            className="dropdown-item"
                                            onClick={exportToPDF}
                                            disabled={exportLoading}
                                        >
                                            <i className="bi bi-file-earmark-pdf me-2"></i>
                                            Export as PDF
                                        </button>
                                    </li>
                                    <li>
                                        <button
                                            className="dropdown-item"
                                            onClick={exportToDocx}
                                            disabled={exportLoading}
                                        >
                                            <i className="bi bi-file-earmark-word me-2"></i>
                                            Export as DOC
                                        </button>
                                    </li>
                                    <li>
                                        <button
                                            className="dropdown-item"
                                            onClick={handlePrint}
                                            disabled={exportLoading}
                                        >
                                            <i className="bi bi-printer me-2"></i>
                                            Print
                                        </button>
                                    </li>
                                </ul>
                            </div>
                            
                            <button
                                type="button"
                                className={`btn btn-secondary ${darkMode ? 'text-light' : ''}`}
                                data-bs-toggle="modal"
                                data-bs-target="#collaborators"
                            >
                                <i className="bi bi-eye-fill"></i> View
                            </button>
                        </div>
                    </div>

                    {/* Quill Editor */}
                    <div className="editor-container border rounded p-3" style={{ minHeight: '60vh' }}>
                        <Editor />
                    </div>
                </div>
            </div>

            {/* Modals */}
            <Modal
                title="Add Collaborator"
                modalId="addCollaborator"
                content={
                    <>
                        <p className={`lead ${darkMode ? 'text-light' : 'text-dark'}`}>
                            Enter the email of the user you want to add as a collaborator
                        </p>
                        <div className="input-group">
                            <input
                                type="email"
                                value={collaboratorEmail}
                                onChange={(e) => setCollaboratorEmail(e.target.value)}
                                className={`form-control ${darkMode ? 'bg-dark text-light' : 'bg-light text-dark'}`}
                                placeholder="Email"
                            />
                            <button className="btn btn-secondary" data-bs-dismiss="modal" id="closeTheModal">Close</button>
                            <button className="btn btn-primary" onClick={handleAddCollaborator}>Add</button>
                        </div>
                    </>
                }
            />

            <Modal
                title="Collaborators"
                modalId="collaborators"
                content={
                    <ul className={`list-group ${darkMode ? 'bg-dark text-light' : 'bg-light text-dark'}`}>
                        {collaborators?.map((user, index) => (
                            <li key={index} className={`list-group-item ${darkMode ? 'bg-dark text-light' : 'bg-light text-dark'}`}>
                                <i className="bi bi-person"></i>&nbsp;{user?.username}
                            </li>
                        ))}
                    </ul>
                }
            />
        </div>
    );

};

export default EditDocument;